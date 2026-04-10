import axios from "axios";

const SNAPSHOT_API = "https://hub.snapshot.org/graphql";

/**
 * Get all DAO votes cast by a wallet address
 */
export async function getDAOVotes(address) {
  const query = `
    query Votes($voter: String!) {
      votes(
        first: 1000
        where: { voter: $voter }
        orderBy: "created"
        orderDirection: desc
      ) {
        id
        voter
        proposal {
          id
          title
          space {
            id
            name
          }
        }
        choice
        created
      }
    }
  `;

  try {
    const { data } = await axios.post(
      SNAPSHOT_API,
      { query, variables: { voter: address } },
      { headers: { "Content-Type": "application/json" }, timeout: 10000 }
    );

    const votes = data?.data?.votes || [];
    const spaces = new Set(votes.map((v) => v.proposal?.space?.id).filter(Boolean));

    return {
      totalVotes: votes.length,
      uniqueSpaces: spaces.size,
      votes,
    };
  } catch (err) {
    console.error("[SnapshotService] getDAOVotes error:", err.message);
    return { totalVotes: 0, uniqueSpaces: 0, votes: [] };
  }
}

/**
 * Check if a wallet has created a Snapshot space with 50+ members
 */
export async function getCreatedSpaces(address) {
  const query = `
    query Spaces($admins: [String!]) {
      spaces(
        first: 100
        where: { admins_contains: $admins }
      ) {
        id
        name
        followersCount
      }
    }
  `;

  try {
    const { data } = await axios.post(
      SNAPSHOT_API,
      { query, variables: { admins: [address.toLowerCase()] } },
      { headers: { "Content-Type": "application/json" }, timeout: 10000 }
    );

    const spaces = data?.data?.spaces || [];
    return spaces.filter((s) => s.followersCount >= 50);
  } catch (err) {
    console.error("[SnapshotService] getCreatedSpaces error:", err.message);
    return [];
  }
}

export default { getDAOVotes, getCreatedSpaces };