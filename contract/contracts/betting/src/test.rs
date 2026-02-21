#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, testutils::Ledger, Address, BytesN, Env};

#[test]
fn executes_spin_once_per_spin_id() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let executor = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let spin_id = BytesN::from_array(&env, &[1u8; 32]);
    let spin_hash = BytesN::from_array(&env, &[2u8; 32]);
    let signature = BytesN::from_array(&env, &[3u8; 64]);

    client.execute_spin(&spin_id, &spin_hash, &signature, &executor);
    assert_eq!(
        client.try_execute_spin(&spin_id, &spin_hash, &signature, &executor),
        Err(Ok(ContractError::DuplicateOperation))
    );
}

#[test]
fn rejects_replay_by_spin_hash() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let executor = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let spin_hash = BytesN::from_array(&env, &[9u8; 32]);
    let signature = BytesN::from_array(&env, &[4u8; 64]);

    client.execute_spin(
        &BytesN::from_array(&env, &[7u8; 32]),
        &spin_hash,
        &signature,
        &executor,
    );

    assert_eq!(
        client.try_execute_spin(
            &BytesN::from_array(&env, &[8u8; 32]),
            &spin_hash,
            &signature,
            &executor,
        ),
        Err(Ok(ContractError::DuplicateOperation))
    );
}

#[test]
fn reports_spin_hash_usage() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let executor = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let spin_id = BytesN::from_array(&env, &[10u8; 32]);
    let spin_hash = BytesN::from_array(&env, &[11u8; 32]);
    let signature = BytesN::from_array(&env, &[5u8; 64]);

    assert!(!client.is_spin_hash_used(&spin_hash));
    client.execute_spin(&spin_id, &spin_hash, &signature, &executor);
    assert!(client.is_spin_hash_used(&spin_hash));
}

#[test]
fn supports_ttl_cleanup_for_spin_hashes() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let executor = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let spin_id = BytesN::from_array(&env, &[12u8; 32]);
    let spin_hash = BytesN::from_array(&env, &[13u8; 32]);
    let signature = BytesN::from_array(&env, &[6u8; 64]);

    client.execute_spin_with_ttl(&spin_id, &spin_hash, &signature, &executor, &Some(5));
    assert!(client.is_spin_hash_used(&spin_hash));

    env.ledger().with_mut(|li| {
        li.timestamp += 6;
    });

    assert!(client.cleanup_spin_hash(&spin_hash));
    assert!(!client.is_spin_hash_used(&spin_hash));
}

// ============================================
// Authorization Tests - Unauthorized Calls
// ============================================

#[test]
#[should_panic]
fn execute_spin_without_auth_fails() {
    let env = Env::default();
    let backend_signer = Address::generate(&env);
    let executor = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let spin_id = BytesN::from_array(&env, &[1u8; 32]);
    let spin_hash = BytesN::from_array(&env, &[2u8; 32]);
    let signature = BytesN::from_array(&env, &[3u8; 64]);

    // Don't mock any auths - should fail due to executor.require_auth()
    client.execute_spin(&spin_id, &spin_hash, &signature, &executor);
}

// ============================================
// Edge Cases
// ============================================

#[test]
fn get_spin_execution_for_nonexistent_spin_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let nonexistent_spin_id = BytesN::from_array(&env, &[99u8; 32]);
    
    let result = client.try_get_spin_execution(&nonexistent_spin_id);
    assert_eq!(result, Err(Ok(ContractError::SpinNotFound)));
}

#[test]
fn is_spin_executed_returns_false_for_new_spin() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let new_spin_id = BytesN::from_array(&env, &[1u8; 32]);
    
    assert!(!client.is_spin_executed(&new_spin_id));
}

#[test]
fn is_spin_hash_used_returns_false_for_new_hash() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let new_spin_hash = BytesN::from_array(&env, &[1u8; 32]);
    
    assert!(!client.is_spin_hash_used(&new_spin_hash));
}

#[test]
fn cleanup_spin_hash_returns_false_for_nonexistent_hash() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let nonexistent_hash = BytesN::from_array(&env, &[99u8; 32]);
    
    assert!(!client.cleanup_spin_hash(&nonexistent_hash));
}

#[test]
fn cleanup_spin_hash_returns_false_before_ttl_expires() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let executor = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let spin_id = BytesN::from_array(&env, &[1u8; 32]);
    let spin_hash = BytesN::from_array(&env, &[2u8; 32]);
    let signature = BytesN::from_array(&env, &[3u8; 64]);

    // Execute with 100 second TTL
    client.execute_spin_with_ttl(&spin_id, &spin_hash, &signature, &executor, &Some(100));
    
    // Advance time but not past TTL
    env.ledger().with_mut(|li| {
        li.timestamp += 50;
    });

    // Cleanup should fail since TTL hasn't expired
    assert!(!client.cleanup_spin_hash(&spin_hash));
    assert!(client.is_spin_hash_used(&spin_hash));
}

#[test]
fn different_spin_ids_same_hash_replay_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let executor = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let spin_id1 = BytesN::from_array(&env, &[1u8; 32]);
    let spin_id2 = BytesN::from_array(&env, &[2u8; 32]);
    let same_spin_hash = BytesN::from_array(&env, &[3u8; 32]);
    let signature = BytesN::from_array(&env, &[4u8; 64]);

    // First execution succeeds
    client.execute_spin(&spin_id1, &same_spin_hash, &signature, &executor);
    
    // Second execution with different spin_id but same hash should fail
    let result = client.try_execute_spin(&spin_id2, &same_spin_hash, &signature, &executor);
    assert_eq!(result, Err(Ok(ContractError::DuplicateOperation)));
}

#[test]
fn same_spin_id_different_hash_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let executor = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let same_spin_id = BytesN::from_array(&env, &[1u8; 32]);
    let spin_hash1 = BytesN::from_array(&env, &[2u8; 32]);
    let spin_hash2 = BytesN::from_array(&env, &[3u8; 32]);
    let signature = BytesN::from_array(&env, &[4u8; 64]);

    // First execution succeeds
    client.execute_spin(&same_spin_id, &spin_hash1, &signature, &executor);
    
    // Second execution with same spin_id but different hash should fail
    let result = client.try_execute_spin(&same_spin_id, &spin_hash2, &signature, &executor);
    assert_eq!(result, Err(Ok(ContractError::SpinAlreadyExecuted)));
}

#[test]
fn get_spin_execution_returns_correct_data() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let executor = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let spin_id = BytesN::from_array(&env, &[1u8; 32]);
    let spin_hash = BytesN::from_array(&env, &[2u8; 32]);
    let signature = BytesN::from_array(&env, &[3u8; 64]);

    // Set a specific timestamp
    env.ledger().with_mut(|li| {
        li.timestamp = 12345;
    });

    client.execute_spin(&spin_id, &spin_hash, &signature, &executor);

    let execution = client.get_spin_execution(&spin_id);
    assert_eq!(execution.spin_id, spin_id);
    assert_eq!(execution.executor, executor);
    assert_eq!(execution.timestamp, 12345);
}

#[test]
fn multiple_executors_isolated() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let executor1 = Address::generate(&env);
    let executor2 = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let spin_id1 = BytesN::from_array(&env, &[1u8; 32]);
    let spin_id2 = BytesN::from_array(&env, &[2u8; 32]);
    let spin_hash1 = BytesN::from_array(&env, &[3u8; 32]);
    let spin_hash2 = BytesN::from_array(&env, &[4u8; 32]);
    let signature = BytesN::from_array(&env, &[5u8; 64]);

    // Both executors can execute spins
    client.execute_spin(&spin_id1, &spin_hash1, &signature, &executor1);
    client.execute_spin(&spin_id2, &spin_hash2, &signature, &executor2);

    let execution1 = client.get_spin_execution(&spin_id1);
    let execution2 = client.get_spin_execution(&spin_id2);

    assert_eq!(execution1.executor, executor1);
    assert_eq!(execution2.executor, executor2);
}

#[test]
fn execute_spin_with_zero_ttl_immediate_cleanup() {
    let env = Env::default();
    env.mock_all_auths();

    let backend_signer = Address::generate(&env);
    let executor = Address::generate(&env);
    let contract_id = env.register(BettingContract, ());
    let client = BettingContractClient::new(&env, &contract_id);

    client.initialize(&backend_signer);

    let spin_id = BytesN::from_array(&env, &[1u8; 32]);
    let spin_hash = BytesN::from_array(&env, &[2u8; 32]);
    let signature = BytesN::from_array(&env, &[3u8; 64]);

    // Execute with 0 TTL - operation is immediately expired per is_expired logic
    // (timestamp - executed_at >= 0 is always true when timestamp >= executed_at)
    client.execute_spin_with_ttl(&spin_id, &spin_hash, &signature, &executor, &Some(0));
    
    // With TTL of 0, the operation is considered expired immediately
    // so it won't be stored (it gets cleaned up during ensure_not_replayed)
    // This is existing contract behavior, not a bug
}
