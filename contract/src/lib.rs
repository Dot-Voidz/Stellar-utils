#![no_std]

use soroban_sdk::{contractimpl, contracttype, symbol, Address, Env, Map};

pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    // Initialize contract owner and empty balances map
    pub fn initialize(env: Env, owner: Address) {
        env.storage().set(&symbol!("owner"), &owner);
        let map: Map<Address, i128> = Map::new(&env);
        env.storage().set(&symbol!("balances"), &map);
    }

    // Credit an account's balance (for demo/testing via host calls)
    pub fn deposit(env: Env, to: Address, amount: i128) {
        let mut map: Map<Address, i128> = env
            .storage()
            .get(&symbol!("balances"))
            .unwrap_or(Map::new(&env));
        let cur = map.get(&to).unwrap_or(0);
        map.set(&to, &(cur + amount));
        env.storage().set(&symbol!("balances"), &map);
    }

    // Withdraw reduces stored balance (does not perform native transfers in this stub)
    pub fn withdraw(env: Env, to: Address, amount: i128) {
        let mut map: Map<Address, i128> = env
            .storage()
            .get(&symbol!("balances"))
            .unwrap_or(Map::new(&env));
        let cur = map.get(&to).unwrap_or(0);
        if cur < amount {
            panic!("insufficient balance");
        }
        map.set(&to, &(cur - amount));
        env.storage().set(&symbol!("balances"), &map);
    }

    // Query balance
    pub fn balance(env: Env, addr: Address) -> i128 {
        let map: Map<Address, i128> = env
            .storage()
            .get(&symbol!("balances"))
            .unwrap_or(Map::new(&env));
        map.get(&addr).unwrap_or(0)
    }

    // Get owner
    pub fn owner(env: Env) -> Address {
        env.storage().get(&symbol!("owner")).unwrap()
    }
}

mod test {
    // Unit tests are omitted in this scaffold. Use the Soroban CLI to test/compile.
}
