import { BigInt, Address , store, Bytes, ByteArray, log} from "@graphprotocol/graph-ts";
import {
  ProposalCreated as ProposalCreatedEvent,
  VoteCast as VoteCastEvent,
	ProposalCanceled as ProposalCanceledEvent,
	ProposalExecuted as ProposalExecutedEvent,
	EtherSent as EtherSentEvent,
	EtherDeposited as EtherDepositedEvent,
  ApprovedToDomain as ApprovedToDomainEvent,
  RevokedDomainAllowance as RevokedDomainAllowanceEvent,
} from "../generated/GovernorNPO/GovernorNPO";
import {
  Minted as MintedEvent,
  AddedReputation as AddedReputationEvent,
  AddedNewRole as AddedNewRoleEvent,
  RoleGranted as RoleGrantedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
	SetEvaluationRound as SetEvaluationRoundEvent,
  Burned as BurnedEvent,
  RoleRevoked as RoleRevokedEvent,
  // SBRTManager as SBRTManagerContract,
} from "../generated/SBRTManager/SBRTManager";

import {
	Member,
  Token,
	Reputation,
  Role,
  Role_Member,
	EvaluationRound,
	Proposal,
	Transaction,
	Vote,
} from "../generated/schema";

// -----------------------------------------------------------
// GovernorNPO Event Handlers
// -----------------------------------------------------------

export function handleProposalCreated(event: ProposalCreatedEvent): void {
	let proposal = new Proposal(event.params.proposalId.toString());
  let member = Member.load(event.params.proposer.toHexString());
  if(member == null) return;
	proposal.proposer = event.params.proposer.toHexString();
	proposal.description = event.params.description;
	proposal.targets = event.params.targets.map<string>(x => x.toHexString());
	proposal.values = event.params.values;
	proposal.calldatas = event.params.calldatas;
	proposal.startBlock = event.params.startBlock;
	proposal.endBlock = event.params.endBlock;
	proposal.forVotes = BigInt.fromI32(0);
	proposal.againstVotes = BigInt.fromI32(0);
	proposal.abstainVotes = BigInt.fromI32(0);
  member.pCount = member.pCount++;
  member.save();
	proposal.save();
}

export function handleVoteCast(event: VoteCastEvent): void {
	let vote = new Vote(event.transaction.hash.toHexString());
	vote.voter = event.params.voter.toHexString();
	vote.proposal = event.params.proposalId.toString();
	vote.support = event.params.support;
	vote.weight = event.params.weight;
	vote.reason = event.params.reason;
	vote.timestamp = event.block.timestamp;
	let proposal = Proposal.load(event.params.proposalId.toHexString());
	if (proposal == null) return;
	if (event.params.support == 0) {
		proposal.againstVotes.plus(event.params.weight);
	}
	if (event.params.support == 1) {
		proposal.forVotes.plus(event.params.weight);
	}
	if (event.params.support == 2) {
		proposal.abstainVotes.plus(event.params.weight);
	}
  let member = Member.load(event.params.voter.toHexString());
  if(member == null) return;
  member.vCount = member.vCount++;
	vote.save();
	proposal.save();
}

export function handleProposalCanceled(event: ProposalCanceledEvent): void {
	let proposal = Proposal.load(event.params.proposalId.toHexString());
	if (proposal == null) return;
	proposal.executed = true;
	proposal.save();
}

export function handleProposalExecuted(event: ProposalExecutedEvent): void {
	let proposal = Proposal.load(event.params.proposalId.toHexString());
	if (proposal == null) return;
	proposal.canceled = true;
	proposal.save();
}

export function handleEtherSent(event: EtherSentEvent): void {
	let transaction = new Transaction(event.transaction.hash.toHexString());
	transaction.timestamp = event.block.timestamp;
	transaction.isIncoming = false;
	transaction.srcOrDst = event.params.to.toHexString();
	transaction.amount = event.params.amount;
	transaction.reference = event.params.reason;
	transaction.save();
}

export function handleEtherDeposited(event: EtherDepositedEvent): void {
	let transaction = new Transaction(event.transaction.hash.toHexString());
  transaction.timestamp = event.block.timestamp;
	transaction.isIncoming = true;
	transaction.srcOrDst = event.params.from.toHexString();
	transaction.amount = event.params.amount;
	transaction.save();
}

export function handleApprovedToDomain(event: ApprovedToDomainEvent): void {
  let role = Role.load(event.params.domainId.toHexString());
  if(role == null) return;
  role.allowance = event.params.amount;
  role.save();
}

export function hadleRevokedAllowance(event: RevokedDomainAllowanceEvent): void {
  let role = Role.load(event.params.domainId.toHexString());
  if(role == null) return;
  role.allowance = BigInt.fromI32(0);
  role.save();
}

// -----------------------------------------------------------
// SBRTManager Event Handlers
// -----------------------------------------------------------

// TODO: fix this. contract call dose not return tokenURI
// function getTokenURI(address: Address, tokenId: BigInt): string {
//   let managerContract = SBRTManagerContract.bind(address);
//   let callResult = managerContract.try_tokenURI(tokenId);
//   return callResult.reverted ? "" : callResult.value;
// }

export function handleMinted(event: MintedEvent): void {
  let token = new Token(event.params.id.toString());
  token.owner = event.params.to.toHexString();
  token.uri = "";
  token.save();

  let member = new Member(event.params.to.toHexString());
  member.token = event.params.id.toString();
  member.acceptedBy = event.params.src.toHexString();
  member.rCount = 0;
  member.vCount = 0;
  member.pCount = 0;
  member.eCount = 0;
  member.save();
}

// TODO: refactor this not to use nullable types of Role entity
export function handleAddedReputation(event: AddedReputationEvent): void {
	let reputation = new Reputation(event.transaction.hash.toHex() + "-" + event.logIndex.toString());
	reputation.contributor = event.params.contributor.toHexString();
	reputation.evaluator = event.params.evaluator.toHexString();
  let domain = Role.load(event.params.domainId.toHexString());
  if(!domain) {
    domain = new Role(event.params.domainId.toHexString());
    domain.save();
  }
  reputation.domain = event.params.domainId.toHexString();
	reputation.reason = event.params.reason;
	reputation.timestamp = event.block.timestamp;
	reputation.evaluationRound = event.params.roundId.toString();
	reputation.save();

	let receiver = Member.load(event.params.contributor.toHexString());
	let evaluator = Member.load(event.params.evaluator.toHexString());
	if (!receiver|| !evaluator) return;
  receiver.rCount++;
  evaluator.eCount++;
	receiver.save();
  evaluator.save();
  
  // TODO: update tokenURI for receiver and evaluator
  // let receiverToken = Token.load(receiver.token);
  // let evaluatorToken = Token.load(evaluator.token);
  // if(!receiverToken || !evaluatorToken) return;
  // receiverToken.uri = getTokenURI(event.address, BigInt.fromString(receiverToken.id));
  // evaluatorToken.uri = getTokenURI(event.address, BigInt.fromString(evaluatorToken.id));
  // receiverToken.save();
  // evaluatorToken.save();
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let roleMember = new Role_Member(event.params.roleId.toHexString().concat(event.params.account.toHexString()));
  roleMember.role = event.params.roleId.toHexString();
  roleMember.member = event.params.account.toHexString();
  roleMember.save();
  
  // TODO: update tokenURI for account
  // let member = Member.load(event.params.account.toHexString());
  // if (!member) return;
  // let accountToken = Token.load(member.token);
  // if(!accountToken) return;
  // accountToken.uri = getTokenURI(event.address, BigInt.fromString(accountToken.id));
  // accountToken.save();
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let role = Role.load(event.params.roleId.toHexString());
  if(!role) return;
  role.adminRole = event.params.newAdminRole.toHexString();
  role.save();
}

export function handleAddedNewRole(event: AddedNewRoleEvent): void {
  let adminRole = new Role(event.params.adminRoleId.toHexString());
  adminRole.name = event.params.adminRoleName;
  adminRole.adminRole = Bytes.fromI32(0).toHexString();
  adminRole.save();

  let role = new Role(event.params.roleId.toHexString());
  role.name = event.params.roleName;
  role.adminRole = event.params.adminRoleId.toHexString();
  role.allowance = BigInt.fromI32(0);
  role.save();
}

export function handleSetEvaluation(event: SetEvaluationRoundEvent): void {
	let round = new EvaluationRound(event.params.roundId.toString());
	round.startBlock = event.params.startBlock;
	round.endBlock = event.params.endBlock;
	round.save();
}

export function handleBurned(event: BurnedEvent): void {
  let member = Member.load(event.params.owner.toString());
  if (member == null) return;
  store.remove('Member', member.id);
}
export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let memberRole = Role_Member.load(event.params.roleId.toHexString().concat(event.params.account.toHexString()));
  if (memberRole == null) return;
  store.remove('MemberRole', memberRole.id);
}