// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Runway Achievement Collection — a single, permanent soulbound
 * (non-transferable) ERC-721 that spans every Runway episode. Episode 2+
 * achievements mint into this exact same contract, tagged with their own
 * episode number — there is deliberately no per-episode collection, because
 * the whole point is one evolving on-chain Career tied to one wallet.
 *
 * These are proof, not collectibles: each token is permanently bound to the
 * wallet that earned it. Some achievements represent a specific verified
 * CipherOps Mission transaction (checked client-side against the real
 * receipt before this is ever called); others represent a broader Runway
 * career milestone. Either way, the mint transaction itself is real — this
 * contract just never re-verifies the underlying claim itself, the game
 * does, exactly like the rest of the Mission pipeline.
 *
 * No burn function exists anywhere in this contract — achievements cannot
 * be destroyed by their owner or by anyone else, ever.
 *
 * Sepolia only. Never deploy this to mainnet.
 */
contract RunwayAchievements is ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;

    /// tokenId => fully-formed token metadata URI (a data: URI in practice,
    /// so no external hosting is required for the metadata JSON itself).
    mapping(uint256 => string) private _tokenURIs;

    /// tokenId => the achievement id this token represents.
    mapping(uint256 => string) public tokenAchievementId;

    /// tokenId => which Runway episode this achievement belongs to.
    mapping(uint256 => uint16) public tokenEpisode;

    /// player => achievementId => already minted, so the same achievement
    /// can't be claimed twice by the same wallet, ever, across all episodes.
    mapping(address => mapping(string => bool)) public hasMinted;

    /// player => achievementId => tokenId, for O(1) "which token is this" lookups.
    mapping(address => mapping(string => uint256)) public achievementTokenId;

    event AchievementMinted(address indexed player, string achievementId, uint16 episode, uint256 indexed tokenId);

    constructor() ERC721("Runway Achievement Collection", "RUNWAY") Ownable(msg.sender) {}

    /**
     * Mints the caller's own achievement token. The caller is always the
     * connected wallet in the Runway UI — there is no privileged minter,
     * because whatever this achievement represents was already verified by
     * the game (a real Mission transaction, or a real session milestone)
     * before this function is ever called.
     */
    function mintAchievement(string calldata achievementId, uint16 episode, string calldata metadataURI) external returns (uint256) {
        require(!hasMinted[msg.sender][achievementId], "RunwayAchievements: already minted");
        hasMinted[msg.sender][achievementId] = true;

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _tokenURIs[tokenId] = metadataURI;
        tokenAchievementId[tokenId] = achievementId;
        tokenEpisode[tokenId] = episode;
        achievementTokenId[msg.sender][achievementId] = tokenId;

        emit AchievementMinted(msg.sender, achievementId, episode, tokenId);
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    /// Every achievement `player` currently owns, in mint order — the
    /// on-chain source of truth the Career Profile reads directly.
    function achievementsOf(address player)
        external
        view
        returns (string[] memory ids, uint256[] memory tokenIds, uint16[] memory episodes)
    {
        uint256 count = balanceOf(player);
        ids = new string[](count);
        tokenIds = new uint256[](count);
        episodes = new uint16[](count);
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(player, i);
            tokenIds[i] = tokenId;
            ids[i] = tokenAchievementId[tokenId];
            episodes[i] = tokenEpisode[tokenId];
        }
    }

    /// Total achievements minted so far, across every player and episode —
    /// used client-side for time-limited achievements like "Early Adopter".
    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    /// Soulbound: block every transfer path. Minting (from == 0) is the only
    /// allowed path — there is no burn function, so to == 0 never happens.
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721Enumerable) returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("RunwayAchievements: soulbound, non-transferable");
        }
        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert("RunwayAchievements: soulbound, non-transferable");
    }

    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert("RunwayAchievements: soulbound, non-transferable");
    }
}
