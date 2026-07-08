#![no_std]

use soroban_sdk::{contractimpl, symbol, Address, Env, Map};

pub struct DashboardContract;

#[contractimpl]
impl DashboardContract {
    pub fn initialize(env: Env, owner: Address) {
        env.storage().set(&symbol!("owner"), &owner);
        let map: Map<Address, i128> = Map::new(&env);
        env.storage().set(&symbol!("balances"), &map);
    }

    pub fn register_balance(env: Env, who: Address, amount: i128) {
        let mut map: Map<Address, i128> = env
            .storage()
            .get(&symbol!("balances"))
            .unwrap_or(Map::new(&env));
        let cur = map.get(&who).unwrap_or(0);
        map.set(&who, &(cur + amount));
        env.storage().set(&symbol!("balances"), &map);
    }

    pub fn get_balance(env: Env, who: Address) -> i128 {
        let map: Map<Address, i128> = env
            .storage()
            .get(&symbol!("balances"))
            .unwrap_or(Map::new(&env));
        map.get(&who).unwrap_or(0)
    }
}
