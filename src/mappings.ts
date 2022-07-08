import { BigInt, Address } from "@graphprotocol/graph-ts";
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
	SetEvaluationRound as SetEvaluationRoundEvent,
  AddedReputation as AddedReputationEvent,
  Minted as MintedEvent,
  Burned as BurnedEvent,
  AddedNewRole as AddedNewRoleEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
} from "../generated/SBRTManager/SBRTManager";

import {
	Transaction,
	Member,
  MemberRole,
  Role,
	Reputation,
	EvaluationRound,
	Proposal,
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
	proposal.targets = event.params.targets.map(x => x.toHexString());
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

export function handleSetEvaluation(event: SetEvaluationRoundEvent): void {
	let round = new EvaluationRound(event.params.roundId.toString());
	round.startBlock = event.params.startBlock;
	round.endBlock = event.params.endBlock;
	round.save();
}

// TODO:: refactor this when the contract is updated to mint multiple tokens per member
export function handleMinted(event: MintedEvent): void {
  let member = new Member(event.params.to.toHexString());
  member.tokenId = event.params.id;
  member.acceptedBy = event.params.src.toHexString();
  member.rCount = 0;
  member.vCount = 0;
  member.pCount = 0;
  member.eCount = 0;
  member.save();
}

export function handleBurned(event: BurnedEvent): void {
  let member = Member.load(event.params.owner.toString());
  if (member == null) return;
  member.tokenId = BigInt.fromI32(0);
  member.save();
}

export function handleAddedReputation(event: AddedReputationEvent): void {
	let reputation = new Reputation(event.transaction.hash.toHexString());
	reputation.contributor = event.params.contributor.toHexString();
	reputation.evaluator = event.params.evaluator.toHexString();
  reputation.domain = event.params.domainId.toString();
	reputation.reason = event.params.reason;
	reputation.timestamp = event.block.timestamp;
	reputation.evaluationRound = event.params.roundId.toString();
	reputation.save();

	let receiver = Member.load(event.params.contributor.toHexString());
	let evaluator = Member.load(event.params.evaluator.toHexString());
	if (receiver == null || evaluator == null) return;
  receiver.rCount = receiver.rCount++;
  evaluator.eCount = evaluator.eCount++;
	receiver.save();
  evaluator.save();
}

export function handleAddedNewRole(event: AddedNewRoleEvent): void {
  let adminRole = new Role(event.params.adminRoleId.toHexString());
  adminRole.name = event.params.adminRole;
  adminRole.save();
  let role = new Role(event.params.roleId.toHexString());
  role.name = event.params.role;
  role.adminRole = adminRole.id;
  role.allowance = BigInt.fromI32(0);
  role.save();
  event.params.initialMembers.forEach(member => {
    let memberRole = new MemberRole(role.id.concat(member.toHexString()));
    memberRole.member = member.toHexString();
    memberRole.role = role.id;
    memberRole.save();
  });
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let role = Role.load(event.params.role.toString());
  if (role == null) return;
  role.adminRole = event.params.newAdminRole.toString();
  role.save();
}

// TODO:: refactor this. define domainID as either String or Bytes
export function handleRoleGranted(event: RoleGrantedEvent): void {
  let memberRole = new MemberRole(event.params.role.toHexString().concat(event.params.account.toHexString()));
  memberRole.member = event.params.account.toHexString();
  memberRole.role = event.params.role.toHexString();
  memberRole.save();
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let memberRole = MemberRole.load(event.params.role.toHexString().concat(event.params.account.toHexString()));
  if (memberRole == null) return;
  // TODO: refactor this to delete the member role
  memberRole.unset("role");
  memberRole.unset("member");
  memberRole.unset('id');
  memberRole.save();
}