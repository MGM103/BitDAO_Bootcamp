// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract tokenSwap {
    ISwapRouter public immutable swapRouter;
    uint24 defaultFee = 3000;

    constructor(ISwapRouter _swapRouter){
        swapRouter = _swapRouter;
    }

    function swapExactInputSingle(uint256 _amountIn, address _tokenIn, address _tokenOut) external returns(uint256 amountOut){
        //error checking for addresses requried
        require(_amountIn > 0);

        //This line transfers the tokens from the individual making a trade to the contract
        //In our test we have already sent the tokens to the contract to swap, therefore this 
        //line is not longer needed
        //TransferHelper.safeTransferFrom(_tokenIn, msg.sender, address(this), _amountIn);

        TransferHelper.safeApprove(_tokenIn, address(swapRouter), _amountIn);

        ISwapRouter.ExactInputSingleParams memory swapParams = ISwapRouter.ExactInputSingleParams({
            tokenIn: _tokenIn,
            tokenOut: _tokenOut,
            fee: defaultFee,
            recipient: msg.sender,
            deadline: block.timestamp,
            amountIn: _amountIn,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        });

        amountOut = swapRouter.exactInputSingle(swapParams);
    }
}
