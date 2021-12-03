import { BigInt, Address } from "@graphprotocol/graph-ts";

import {
	EtherDeposited as EtherDepositedEvent,
	EtherSent as EtherSentEvent,
} from "../generated/Treasury/Treasury";
import { Transfer as TransferEvent } from "../generated/NToken/NToken";
import {
	EvaluationStarted as EvaluationStartedEvent,
	ReputationMinted as ReputationMintedEvent,
} from "../generated/Reputation/Reputation";
import {
	ProposalCreated as ProposalCreatedEvent,
	VoteCast as VoteCastEvent,
	ProposalCanceled as ProposalCanceledEvent,
	ProposalExecuted as ProposalExecutedEvent,
} from "../generated/Voting/Voting";

import {
	Transaction,
	User,
	Reputation,
	EvaluationRound,
	Proposal,
	Vote,
} from "../generated/schema";

////////////// Treasury contract event handlers //////////////

export function handleEtherDeposited(event: EtherDepositedEvent): void {
	let transaction = new Transaction(event.params.transactionId.toString());

	transaction.isIncoming = true;
	transaction.tokenOrEther = Address.zero();
	transaction.srcOrDst = event.params.source;
	transaction.amount = event.params.amount;
	transaction.reference = event.params.information;
	transaction.transactionHash = event.transaction.hash;
	transaction.save();
}

export function handleEtherSent(event: EtherSentEvent): void {
	let transaction = new Transaction(event.params.transactionId.toString());

	transaction.isIncoming = false;
	transaction.tokenOrEther = Address.zero();
	transaction.srcOrDst = event.params.target;
	transaction.amount = event.params.amount;
	transaction.reference = event.params.information;
	transaction.transactionHash = event.transaction.hash;
	transaction.save();
}

////////////// Ntoken contract event handlers //////////////

export function handleTransfer(event: TransferEvent): void {
	if (Address.zero() == event.params.from) {
		let receiver = new User(event.params.to.toHexString());
		receiver.tokenBalance = receiver.tokenBalance.plus(event.params.value);
		receiver.save();
		return;
	}

	let sender = User.load(event.params.from.toHexString());
	let receiver = User.load(event.params.to.toHexString());
	if (sender == null) {
		// TODO:: error
		return;
	}
	if (receiver == null) {
		receiver = new User(event.params.to.toHexString());
		receiver.tokenBalance = BigInt.fromI32(0);
	}

	sender.tokenBalance = sender.tokenBalance.minus(event.params.value);
	receiver.tokenBalance = receiver.tokenBalance.plus(event.params.value);

	sender.save();
	receiver.save();
}

////////////// Reputation contract event handlers //////////////

export function handleEvaluationStarted(event: EvaluationStartedEvent): void {
	let round = new EvaluationRound(event.params.roundId.toString());
	// TODO:: refactor this line. Address[] is not assignable to Bytes[]
	round.evaluators = event.params.evaluators.toString();
	round.startBlock = event.params.startBlock;
	round.endBlock = event.params.endBlock;
	round.transactionHash = event.transaction.hash;
	round.save();
}

export function handleReputationMinted(event: ReputationMintedEvent): void {
	let receiver = User.load(event.params.to.toHexString());
	if (receiver == null) {
		receiver = new User(event.params.to.toHexString());
		receiver.tokenBalance = BigInt.fromI32(0);
	}

	let reputation = new Reputation(
		event.transaction.hash.toHexString() + "#" + event.logIndex.toString()
	);
	reputation.evaluationRound = event.params.roundId.toString();
	reputation.owner = event.params.to.toHexString();
	reputation.evaluator = event.params.from.toHexString();
	reputation.expirationTime = event.params.expirationTime;
	reputation.reason = event.params.reason;
	reputation.transactionHash = event.transaction.hash;

	receiver.save();
	reputation.save();
}

////////////// Reputation contract event handlers //////////////

export function handleProposalCreated(event: ProposalCreatedEvent): void {
	let proposal = new Proposal(event.params.proposalId.toString());
	proposal.proposer = event.params.proposer.toHexString();
	proposal.description = event.params.description;
	// TODO:: refactor this line. Address[] is not assignable to Bytes[]
	proposal.targets = event.params.targets.toString();
	proposal.values = event.params.values;
	proposal.calldatas = event.params.calldatas;
	proposal.startBlock = event.params.startBlock;
	proposal.endBlock = event.params.endBlock;
	proposal.forVotes = BigInt.fromI32(0);
	proposal.againstVotes = BigInt.fromI32(0);
	proposal.abstainVotes = BigInt.fromI32(0);

	proposal.save();
}

export function handleVoteCast(event: VoteCastEvent): void {
	let vote = new Vote(event.transaction.hash.toHexString());
	vote.voter = event.params.voter.toHexString();
	vote.proposal = event.params.proposalId.toHexString();
	vote.support = event.params.voteType;
	vote.weight = event.params.weight;
	vote.reason = event.params.reason;
	vote.timestamp = event.block.timestamp;

	let proposal = Proposal.load(event.params.proposalId.toHexString());
	if (proposal == null) return;

	if (event.params.voteType == 1) {
		proposal.againstVotes.plus(event.params.weight);
	}
	if (event.params.voteType == 2) {
		proposal.forVotes.plus(event.params.weight);
	}
	if (event.params.voteType == 3) {
		proposal.abstainVotes.plus(event.params.weight);
	}

	vote.save();
	proposal.save();
}

export function handleProposalExecuted(event: ProposalExecutedEvent): void {
	let proposal = Proposal.load(event.params.proposalId.toHexString());
	if (proposal == null) return;
	proposal.canceled = true;
	proposal.save();
}

export function handleProposalCanceled(event: ProposalCanceledEvent): void {
	let proposal = Proposal.load(event.params.proposalId.toHexString());
	if (proposal == null) return;
	proposal.executed = true;
	proposal.save();
}
