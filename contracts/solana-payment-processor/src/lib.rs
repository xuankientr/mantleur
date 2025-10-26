use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solana_payment_processor {
    use super::*;

    // Initialize payment processor
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let payment_processor = &mut ctx.accounts.payment_processor;
        payment_processor.authority = ctx.accounts.authority.key();
        payment_processor.usdc_mint = ctx.accounts.usdc_mint.key();
        payment_processor.bump = ctx.bumps.payment_processor;
        Ok(())
    }

    // Deposit USDC to get coins
    pub fn deposit_usdc(ctx: Context<DepositUsdc>, amount: u64) -> Result<()> {
        let payment_processor = &ctx.accounts.payment_processor;
        let user_token_account = &ctx.accounts.user_token_account;
        let processor_token_account = &ctx.accounts.processor_token_account;
        
        // Transfer USDC from user to processor
        let transfer_instruction = Transfer {
            from: user_token_account.to_account_info(),
            to: processor_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );
        
        token::transfer(cpi_ctx, amount)?;
        
        // Calculate coins (1 USDC = 100 coins, USDC has 6 decimals)
        let coins = amount * 100; // 1 USDC = 100 coins
        
        // Emit event
        emit!(DepositEvent {
            user: ctx.accounts.user.key(),
            amount,
            coins,
        });
        
        Ok(())
    }

    // Withdraw USDC using coins
    pub fn withdraw_usdc(ctx: Context<WithdrawUsdc>, coins: u64) -> Result<()> {
        let payment_processor = &ctx.accounts.payment_processor;
        let user_token_account = &ctx.accounts.user_token_account;
        let processor_token_account = &ctx.accounts.processor_token_account;
        
        // Calculate USDC amount (100 coins = 1 USDC)
        let usdc_amount = coins / 100;
        
        // Transfer USDC from processor to user
        let transfer_instruction = Transfer {
            from: processor_token_account.to_account_info(),
            to: user_token_account.to_account_info(),
            authority: payment_processor.to_account_info(),
        };
        
        let seeds = &[
            b"payment_processor",
            &[payment_processor.bump],
        ];
        let signer = &[&seeds[..]];
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer,
        );
        
        token::transfer(cpi_ctx, usdc_amount)?;
        
        // Emit event
        emit!(WithdrawEvent {
            user: ctx.accounts.user.key(),
            coins,
            usdc_amount,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 1,
        seeds = [b"payment_processor"],
        bump
    )]
    pub payment_processor: Account<'info, PaymentProcessor>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: This is the USDC mint address
    pub usdc_mint: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositUsdc<'info> {
    #[account(
        mut,
        seeds = [b"payment_processor"],
        bump = payment_processor.bump
    )]
    pub payment_processor: Account<'info, PaymentProcessor>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub processor_token_account: Account<'info, TokenAccount>,
    pub usdc_mint: Account<'info, token::Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawUsdc<'info> {
    #[account(
        mut,
        seeds = [b"payment_processor"],
        bump = payment_processor.bump
    )]
    pub payment_processor: Account<'info, PaymentProcessor>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub processor_token_account: Account<'info, TokenAccount>,
    pub usdc_mint: Account<'info, token::Mint>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct PaymentProcessor {
    pub authority: Pubkey,
    pub usdc_mint: Pubkey,
    pub bump: u8,
}

#[event]
pub struct DepositEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub coins: u64,
}

#[event]
pub struct WithdrawEvent {
    pub user: Pubkey,
    pub coins: u64,
    pub usdc_amount: u64,
}



