import type {
  UserOperationRequest,
  UserOperationStruct,
} from "@alchemy/aa-core";
import {
  toHex,
  type Client,
  encodeAbiParameters,
  keccak256,
  isHex,
} from "viem";
import {
  BASE_GOERLI_ENTRYPOINT_ADDRESS,
  PRE_VERIFICATION_GAS_BUFFER,
  VERIFICATION_GAS_LIMIT_BUFFER,
} from "./constants";
import { baseGoerli } from "viem/chains";
import type { AlchemyProvider } from "@alchemy/aa-alchemy";

/** Wraps an arbitrary object type to enforce that all values are hex-formatted strings */
type AsHex<T> = {
  [K in keyof T]: `0x${string}`;
};

/**
 * Helper function to convert an arbitrary value from a UserOperation (e.g. `nonce`) to a
 * hexadecimal string.
 */
const formatAsHex = (
  value: undefined | string | Uint8Array | bigint | number
): `0x${string}` | undefined => {
  if (value === undefined) {
    return value;
  } else if (typeof value === "string") {
    if (!isHex(value))
      throw new Error("Cannot convert a non-hex string to a hex string");
    return value as `0x${string}`;
  } else {
    // Handles Uint8Array, bigint, and number
    return toHex(value);
  }
};

/**
 * Helper function to convert the fields of a user operation to hexadecimal strings.
 *
 * @param userOp {UserOperationStruct}
 * @returns {AsHex<UserOperationStruct>} userOp with all fields transformed to hexstrings
 */
const formatUserOpAsHex = (
  userOp: UserOperationStruct
): AsHex<UserOperationStruct> => {
  const {
    sender,
    nonce,
    initCode,
    callData,
    callGasLimit,
    verificationGasLimit,
    preVerificationGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    paymasterAndData,
    signature,
  } = userOp;

  const formattedUserOp: AsHex<UserOperationStruct> = {
    sender: formatAsHex(sender)!,
    nonce: formatAsHex(nonce)!,
    initCode: formatAsHex(initCode)!,
    callData: formatAsHex(callData)!,
    callGasLimit: formatAsHex(callGasLimit),
    verificationGasLimit: formatAsHex(verificationGasLimit),
    preVerificationGas: formatAsHex(preVerificationGas),
    maxFeePerGas: formatAsHex(maxFeePerGas),
    maxPriorityFeePerGas: formatAsHex(maxPriorityFeePerGas),
    paymasterAndData: formatAsHex(paymasterAndData)!,
    signature: formatAsHex(signature)!,
  };

  return formattedUserOp;
};

/**
 * Accepts an unsigned user operation, queries the Base Goerli paymaster, and populates
 * the `paymasterAndData` field of the operation with the paymaster's response. This method will
 * also increment the operation's `preVerificationGas` and `verificationGasLimit` to account
 * for the cost of verifying the paymaster.
 *
 * If the paymaster will not sponsor the user operation, this method will throw an error.
 *
 * @param userOp {UserOperationStruct} unsigned user operation to be sponsored
 * @param rpcClient {Client} Public RPC client connected to the Base Goerli Paymaster
 * @returns {Promise<UserOperationStruct>} unsigned user operation with `paymasterAndData` popuilated
 */
export const populateWithPaymaster = async (
  userOp: UserOperationStruct,
  paymaster: Client
): Promise<UserOperationStruct> => {
  // Format every field in the user op to be a hexstring, to make type conversions easier later
  const formattedUserOp: AsHex<UserOperationStruct> = formatUserOpAsHex(userOp);

  // First, increment the user op's `preVerificationGas` and `verificationGasLimit` with the
  // recommended gas buffers to cover verification of the Base Goerli paymaster
  const bufferedUserOp: AsHex<UserOperationStruct> = {
    ...formattedUserOp,
    preVerificationGas: formattedUserOp.preVerificationGas
      ? toHex(
          BigInt(formattedUserOp.preVerificationGas) +
            PRE_VERIFICATION_GAS_BUFFER
        )
      : undefined,
    verificationGasLimit: formattedUserOp.verificationGasLimit
      ? toHex(
          BigInt(formattedUserOp.verificationGasLimit) +
            VERIFICATION_GAS_LIMIT_BUFFER
        )
      : undefined,
  };

  // Then, query the Base Goerli paymaster with the user operation to determine if it will be sponsored
  try {
    const paymasterResponse: `0x${string}` = await paymaster.request({
      // eth_paymasterAndDataForUserOperation is a relatively new RPC and may throw a type error
      // @ts-ignore
      method: "eth_paymasterAndDataForUserOperation",
      params: [
        // @ts-ignore
        bufferedUserOp,
        BASE_GOERLI_ENTRYPOINT_ADDRESS,
        // @ts-ignore
        toHex(baseGoerli.id),
      ],
    });

    // If the paymaster responds successfully, use the response as the user operation's
    // `paymasterAndData` field
    const populatedUserOp: AsHex<UserOperationStruct> = {
      ...bufferedUserOp,
      paymasterAndData: paymasterResponse,
    };

    return populatedUserOp;
  } catch (error) {
    // If the paymaster responds with an error, it will not sponsor the user operation.
    // You might handle this differently, e.g. try a different paymaster
    throw new Error(`${error}`);
  }
};

/**
 * Accepts an unsigned user operation and packs it. Used as part of the procedure required to
 * compute the user operation's hash and sign it.
 *
 * Adapted to viem from https://github.com/stackup-wallet/userop.js/blob/main/src/context.ts
 *
 * @param userOp {UserOperationStruct} unsigned user operation
 * @returns {`0x${string}`} hexadecimal string representing packed user operation
 */
const packUserOp = (userOp: AsHex<UserOperationStruct>): `0x${string}` => {
  // address -> `0x${string}`, uint256 -> bigint, bytes32 -> `0x${string}`
  const packedUserOp = encodeAbiParameters(
    [
      { name: "sender", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "initCode", type: "bytes32" },
      { name: "callData", type: "bytes32" },
      { name: "callGasLimit", type: "uint256" },
      { name: "verificationGasLimit", type: "uint256" },
      { name: "preVerificationGas", type: "uint256" },
      { name: "maxFeePerGas", type: "uint256" },
      { name: "maxPriorityFeePerGas", type: "uint256" },
      { name: "paymasterAndData", type: "bytes32" },
    ],
    [
      userOp.sender,
      BigInt(userOp.nonce),
      keccak256(userOp.initCode),
      keccak256(userOp.callData),
      BigInt(userOp.callGasLimit!),
      BigInt(userOp.verificationGasLimit!),
      BigInt(userOp.preVerificationGas!),
      BigInt(userOp.maxFeePerGas!),
      BigInt(userOp.maxPriorityFeePerGas!),
      keccak256(userOp.paymasterAndData),
    ]
  );

  return packedUserOp;
};

/**
 * Accepts an unsigned user operation and computes its hash, by first packing it, and then re-encoding
 * and hashing the packed user operation with the entry point address and chain ID.
 *
 * Adapted to viem from https://github.com/stackup-wallet/userop.js/blob/main/src/context.ts
 *
 * @param userOp {UserOperationStruct} unsigned user operation
 * @returns {`0x${string}`} hexadecimal string representing the user operation's hash
 */
const computeUserOpHash = (
  userOp: AsHex<UserOperationStruct>
): `0x${string}` => {
  const packedUserOp = packUserOp(userOp);
  // address -> `0x${string}`, uint256 -> bigint, bytes32 -> `0x${string}`
  const encodedUserOp = encodeAbiParameters(
    [
      { name: "packed", type: "bytes32" },
      { name: "entryPoint", type: "address" },
      { name: "chainId", type: "uint256" },
    ],
    [
      keccak256(packedUserOp),
      BASE_GOERLI_ENTRYPOINT_ADDRESS,
      BigInt(baseGoerli.id),
    ]
  );
  const userOpHash = keccak256(encodedUserOp);
  return userOpHash;
};

/**
 * Accepts an unsigned user operation and computes its hash, and then signature, given the
 * AlchemyProvider for the user's smart wallet. The input user operation should have all of
 * its necessary fields populated/modified (e.g. `paymasterAndData`, `preVerificationGas`, etc.).
 *
 * Adapted to viem from https://github.com/stackup-wallet/userop.js/blob/main/src/context.ts
 *
 * @param userOp {UserOperationStruct} unsigned user operation
 * @returns {Promise<UserOperationRequest>} user operation with the `signature` field populated
 */
export const signUserOp = async (
  userOp: UserOperationStruct,
  provider: AlchemyProvider
): Promise<UserOperationRequest> => {
  // Format every field in the user op to be a hexstring, to make type conversions easier later
  const formattedUserOp = formatUserOpAsHex(userOp);

  // Compute hash and signature
  const userOpHash = computeUserOpHash(formattedUserOp);
  const signature = await provider.signMessage(userOpHash);

  // @ts-ignore
  const signedUserOp: UserOperationRequest = {
    ...userOp,
    signature: signature,
  };

  return signedUserOp;
};
