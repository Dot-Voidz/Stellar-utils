#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

/// Storage keys for the escrow-style balances scaffold.
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Owner,
    Balance(Address),
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Initialize the contract owner. Balances default to 0, so no map is stored.
    pub fn initialize(env: Env, owner: Address) {
        env.storage().instance().set(&DataKey::Owner, &owner);
    }

    /// Credit an account's balance (for demo/testing via host calls).
    pub fn deposit(env: Env, to: Address, amount: i128) {
        let key = DataKey::Balance(to);
        let current: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        env.storage().persistent().set(&key, &(current + amount));
    }

    /// Reduce a stored balance (does not perform native transfers in this stub).
    pub fn withdraw(env: Env, to: Address, amount: i128) {
        let key = DataKey::Balance(to);
        let current: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        if current < amount {
            panic!("insufficient balance");
        }
        env.storage().persistent().set(&key, &(current - amount));
    }

    /// Query balance.
    pub fn balance(env: Env, addr: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(addr))
            .unwrap_or(0)
    }

    /// Get owner.
    pub fn owner(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Owner).unwrap()
    }
}
