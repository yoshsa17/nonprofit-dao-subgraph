// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class EvaluationStarted extends ethereum.Event {
  get params(): EvaluationStarted__Params {
    return new EvaluationStarted__Params(this);
  }
}

export class EvaluationStarted__Params {
  _event: EvaluationStarted;

  constructor(event: EvaluationStarted) {
    this._event = event;
  }

  get roundId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get evaluators(): Array<Address> {
    return this._event.parameters[1].value.toAddressArray();
  }

  get startBlock(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get endBlock(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class ReputationMinted extends ethereum.Event {
  get params(): ReputationMinted__Params {
    return new ReputationMinted__Params(this);
  }
}

export class ReputationMinted__Params {
  _event: ReputationMinted;

  constructor(event: ReputationMinted) {
    this._event = event;
  }

  get roundId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get from(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get to(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get expirationTime(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get reason(): string {
    return this._event.parameters[4].value.toString();
  }
}

export class Reputation__getEvaluationRoundResult {
  value0: BigInt;
  value1: BigInt;
  value2: Array<Address>;

  constructor(value0: BigInt, value1: BigInt, value2: Array<Address>) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    map.set("value2", ethereum.Value.fromAddressArray(this.value2));
    return map;
  }
}

export class Reputation extends ethereum.SmartContract {
  static bind(address: Address): Reputation {
    return new Reputation("Reputation", address);
  }

  getGovernanceAddress(): Address {
    let result = super.call(
      "getGovernanceAddress",
      "getGovernanceAddress():(address)",
      []
    );

    return result[0].toAddress();
  }

  try_getGovernanceAddress(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "getGovernanceAddress",
      "getGovernanceAddress():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  isSlashed(account: Address): boolean {
    let result = super.call("isSlashed", "isSlashed(address):(bool)", [
      ethereum.Value.fromAddress(account)
    ]);

    return result[0].toBoolean();
  }

  try_isSlashed(account: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall("isSlashed", "isSlashed(address):(bool)", [
      ethereum.Value.fromAddress(account)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  getEvaluationRound(id: BigInt): Reputation__getEvaluationRoundResult {
    let result = super.call(
      "getEvaluationRound",
      "getEvaluationRound(uint256):(uint256,uint256,address[])",
      [ethereum.Value.fromUnsignedBigInt(id)]
    );

    return new Reputation__getEvaluationRoundResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
      result[2].toAddressArray()
    );
  }

  try_getEvaluationRound(
    id: BigInt
  ): ethereum.CallResult<Reputation__getEvaluationRoundResult> {
    let result = super.tryCall(
      "getEvaluationRound",
      "getEvaluationRound(uint256):(uint256,uint256,address[])",
      [ethereum.Value.fromUnsignedBigInt(id)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Reputation__getEvaluationRoundResult(
        value[0].toBigInt(),
        value[1].toBigInt(),
        value[2].toAddressArray()
      )
    );
  }

  reputationOf(account: Address): BigInt {
    let result = super.call("reputationOf", "reputationOf(address):(uint256)", [
      ethereum.Value.fromAddress(account)
    ]);

    return result[0].toBigInt();
  }

  try_reputationOf(account: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "reputationOf",
      "reputationOf(address):(uint256)",
      [ethereum.Value.fromAddress(account)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  evaluate(
    roundId: BigInt,
    contributors: Array<Address>,
    reason: Array<string>
  ): boolean {
    let result = super.call(
      "evaluate",
      "evaluate(uint256,address[],string[]):(bool)",
      [
        ethereum.Value.fromUnsignedBigInt(roundId),
        ethereum.Value.fromAddressArray(contributors),
        ethereum.Value.fromStringArray(reason)
      ]
    );

    return result[0].toBoolean();
  }

  try_evaluate(
    roundId: BigInt,
    contributors: Array<Address>,
    reason: Array<string>
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "evaluate",
      "evaluate(uint256,address[],string[]):(bool)",
      [
        ethereum.Value.fromUnsignedBigInt(roundId),
        ethereum.Value.fromAddressArray(contributors),
        ethereum.Value.fromStringArray(reason)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  slash(account: Address): boolean {
    let result = super.call("slash", "slash(address):(bool)", [
      ethereum.Value.fromAddress(account)
    ]);

    return result[0].toBoolean();
  }

  try_slash(account: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall("slash", "slash(address):(bool)", [
      ethereum.Value.fromAddress(account)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  startEvaluation(evaluators: Array<Address>): boolean {
    let result = super.call(
      "startEvaluation",
      "startEvaluation(address[]):(bool)",
      [ethereum.Value.fromAddressArray(evaluators)]
    );

    return result[0].toBoolean();
  }

  try_startEvaluation(
    evaluators: Array<Address>
  ): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "startEvaluation",
      "startEvaluation(address[]):(bool)",
      [ethereum.Value.fromAddressArray(evaluators)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _initialMembers(): Array<Address> {
    return this._call.inputValues[0].value.toAddressArray();
  }

  get governance(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class EvaluateCall extends ethereum.Call {
  get inputs(): EvaluateCall__Inputs {
    return new EvaluateCall__Inputs(this);
  }

  get outputs(): EvaluateCall__Outputs {
    return new EvaluateCall__Outputs(this);
  }
}

export class EvaluateCall__Inputs {
  _call: EvaluateCall;

  constructor(call: EvaluateCall) {
    this._call = call;
  }

  get roundId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get contributors(): Array<Address> {
    return this._call.inputValues[1].value.toAddressArray();
  }

  get reason(): Array<string> {
    return this._call.inputValues[2].value.toStringArray();
  }
}

export class EvaluateCall__Outputs {
  _call: EvaluateCall;

  constructor(call: EvaluateCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class SlashCall extends ethereum.Call {
  get inputs(): SlashCall__Inputs {
    return new SlashCall__Inputs(this);
  }

  get outputs(): SlashCall__Outputs {
    return new SlashCall__Outputs(this);
  }
}

export class SlashCall__Inputs {
  _call: SlashCall;

  constructor(call: SlashCall) {
    this._call = call;
  }

  get account(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SlashCall__Outputs {
  _call: SlashCall;

  constructor(call: SlashCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class StartEvaluationCall extends ethereum.Call {
  get inputs(): StartEvaluationCall__Inputs {
    return new StartEvaluationCall__Inputs(this);
  }

  get outputs(): StartEvaluationCall__Outputs {
    return new StartEvaluationCall__Outputs(this);
  }
}

export class StartEvaluationCall__Inputs {
  _call: StartEvaluationCall;

  constructor(call: StartEvaluationCall) {
    this._call = call;
  }

  get evaluators(): Array<Address> {
    return this._call.inputValues[0].value.toAddressArray();
  }
}

export class StartEvaluationCall__Outputs {
  _call: StartEvaluationCall;

  constructor(call: StartEvaluationCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}