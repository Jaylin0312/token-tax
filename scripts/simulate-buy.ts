import { ethers } from "hardhat";
import { BASE_ROUTER, BASE_WETH } from "../utils/constants";

async function main() {
  const [signer] = await ethers.getSigners();
  const TOKEN = "0x30d19fb77c3ee5cfa97f73d72c6a1e509fa06aef";
  const router = new ethers.Contract(
    BASE_ROUTER,
    [
      "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
      "function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable",
    ],
    signer
  );
  const token = new ethers.Contract(
    TOKEN,
    ["function balanceOf(address owner) view returns (uint256)"],
    signer
  );
  const amountIn = ethers.utils.parseUnits("1", 18);
  const deadline = Math.floor(Date.now() / 1000) + 300;
  const path = [BASE_WETH, TOKEN];
  const expectedOut = await router.getAmountsOut(amountIn, path);
  const expectedTokens = expectedOut[1];
  console.log(
    "🔍 Expected tokens out:",
    ethers.utils.formatUnits(expectedTokens, 18)
  );

  const balanceBefore = await token.balanceOf(signer.address);

  await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
    0,
    path,
    signer.address,
    deadline,
    { value: amountIn }
  );
  const balanceAfter = await token.balanceOf(signer.address);
  const tokensReceived = balanceAfter.sub(balanceBefore);
  console.log(
    "💰 Actual tokens received:",
    ethers.utils.formatUnits(tokensReceived, 18)
  );
  const buyTaxBps = Math.round((1 - tokensReceived / expectedTokens) * 10000);
  console.log("📉 Buy Tax Bps:", buyTaxBps);
}

main().catch(console.error);
