/**
 * 🗳️ Panchayat Election System - Capstone
 *
 * Village ki panchayat election ka system bana! Yeh CAPSTONE challenge hai
 * jisme saare function concepts ek saath use honge:
 * closures, callbacks, HOF, factory, recursion, pure functions.
 *
 * Functions:
 *
 *   1. createElection(candidates)
 *      - CLOSURE: private state (votes object, registered voters set)
 *      - candidates: array of { id, name, party }
 *      - Returns object with methods:
 *
 *      registerVoter(voter)
 *        - voter: { id, name, age }
 *        - Add to private registered set. Return true.
 *        - Agar already registered or voter invalid, return false.
 *        - Agar age < 18, return false.
 *
 *      castVote(voterId, candidateId, onSuccess, onError)
 *        - CALLBACKS: call onSuccess or onError based on result
 *        - Validate: voter registered? candidate exists? already voted?
 *        - If valid: record vote, call onSuccess({ voterId, candidateId })
 *        - If invalid: call onError("reason string")
 *        - Return the callback's return value
 *
 *      getResults(sortFn)
 *        - HOF: takes optional sort comparator function
 *        - Returns array of { id, name, party, votes: count }
 *        - If sortFn provided, sort results using it
 *        - Default (no sortFn): sort by votes descending
 *
 *      getWinner()
 *        - Returns candidate object with most votes
 *        - If tie, return first candidate among tied ones
 *        - If no votes cast, return null
 *
 *   2. createVoteValidator(rules)
 *      - FACTORY: returns a validation function
 *      - rules: { minAge: 18, requiredFields: ["id", "name", "age"] }
 *      - Returned function takes a voter object and returns { valid, reason }
 *
 *   3. countVotesInRegions(regionTree)
 *      - RECURSION: count total votes in nested region structure
 *      - regionTree: { name, votes: number, subRegions: [...] }
 *      - Sum votes from this region + all subRegions (recursively)
 *      - Agar regionTree null/invalid, return 0
 *
 *   4. tallyPure(currentTally, candidateId)
 *      - PURE FUNCTION: returns NEW tally object with incremented count
 *      - currentTally: { "cand1": 5, "cand2": 3, ... }
 *      - Return new object where candidateId count is incremented by 1
 *      - MUST NOT modify currentTally
 *      - If candidateId not in tally, add it with count 1
 *
 * @example
 *   const election = createElection([
 *     { id: "C1", name: "Sarpanch Ram", party: "Janata" },
 *     { id: "C2", name: "Pradhan Sita", party: "Lok" }
 *   ]);
 *   election.registerVoter({ id: "V1", name: "Mohan", age: 25 });
 *   election.castVote("V1", "C1", r => "voted!", e => "error: " + e);
 *   // => "voted!"
 */
export function createElection(candidates) {
  // Your code here
  let tally = {};
  const registeredVoters = new Map();  
  const votedVoterIds    = new Set();

  candidates.forEach(c => { tally[c.id] = 0; });
  return {
    registerVoter(voter) {
      if (!voter || !voter.id || !voter.name || typeof voter.age !== "number") return false;
      if (voter.age < 18) return false;
      if (registeredVoters.has(voter.id)) return false;

      registeredVoters.set(voter.id, voter);
      return true;
    },

    castVote(voterId, candidateId, onSuccess, onError) {
      if (!registeredVoters.has(voterId)) {
        return onError("Voter not registered");
      }
      if (!(candidateId in tally)) {
        return onError("Candidate not found");
      }
      if (votedVoterIds.has(voterId)) {
        return onError("Voter has already voted");
      }
      tally = tallyPure(tally, candidateId);
      votedVoterIds.add(voterId);
      return onSuccess({ voterId, candidateId });
    },

    getResults(sortFn) {
      const results = candidates.map(c => ({
        ...c,
        votes: tally[c.id]
      }));

      const comparator = sortFn ?? ((a, b) => b.votes - a.votes); 
      return results.sort(comparator);
    },

    getWinner() {
      if (votedVoterIds.size === 0) return null;

      return candidates.reduce((best, current) =>
        tally[current.id] > tally[best.id] ? current : best
      );
    }
  };
}
export function createVoteValidator(rules) {
  // Your code here
  const { minAge = 18, requiredFields = ["id", "name", "age"] } = rules || {};

  return (voter) => {
    if (!voter) return { valid: false, reason: "Voter is null or undefined" };

    for (const field of requiredFields) {
      if (!voter[field] && voter[field] !== 0) {
        return { valid: false, reason: `Missing required field: ${field}` };
      }
    }

    if (typeof voter.age === "number" && voter.age < minAge) {
      return { valid: false, reason: `Voter must be at least ${minAge} years old` };
    }

    return { valid: true, reason: null };
  };
}

export function countVotesInRegions(regionTree) {
  // Your code here
  if (!regionTree || typeof regionTree !== "object") return 0;
  if (typeof regionTree.votes !== "number") return 0;

  const subTotal = Array.isArray(regionTree.subRegions)
    ? regionTree.subRegions.reduce(
        (sum, region) => sum + countVotesInRegions(region), 0  
      )
    : 0;

  return regionTree.votes + subTotal;
}

export function tallyPure(currentTally, candidateId) {
  // Your code here
  return {
    ...currentTally,                                
    [candidateId]: (currentTally[candidateId] ?? 0) + 1 
  };
}