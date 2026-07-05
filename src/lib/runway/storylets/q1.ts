/**
 * Runway — Q1 storylets.
 *
 * Q1 is scrappy: manual, one-off decisions, the lowest-stakes slice of the
 * year. Every situation here is written as a believable startup problem
 * first — the one Mission (Q1-04) only exists because Q1-03 makes a real
 * action the only honest way to resolve it, never because a feature needed
 * screen time.
 *
 * Q1-01a/Q1-01b are two mutually-flavored castings of the same premise —
 * which one becomes eligible for a given character depends on their
 * qualities at the moment, not on authored order. Arbitrating what happens
 * if both are technically eligible at once is a Phase 1 engine concern, not
 * a content concern.
 */

import type { Storylet } from "../types";

export const Q1_STORYLETS: Storylet[] = [
  {
    id: "q1-reg",
    tier: 1,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flagAbsent", has: "confidential-asset-ready" }],
    cast: { mode: "fixed", character: "kai" },
    sceneText:
      "Kai flags it before you've got your coat off. The term sheet says the thing needs to exist today — not eventually, today, that's what was signed. But its name can't touch a public ledger a day before launch, or anyone reading the same chain everyone reads sees exactly what you're building and gets there first. \"Both of those are supposed to be true at once,\" he says. \"Normally they can't be. There's one setup that actually lets them.\"",
    mission: {
      engine: "registry",
      route: "/registry",
      actionSummary: "Wrap a token into its confidential form — real today, unreadable to anyone who isn't supposed to see it yet.",
    },
    choices: [
      {
        id: "reg-careful",
        label: "Take the time, get it right",
        resultText: "Kai checks it himself anyway. Finds nothing wrong. \"Zama's math doesn't lie,\" he says, which from him is basically a toast. \"Good. Now we can actually do things.\"",
        delta: { character: { trustInPlayer: 4 }, characterId: "kai", flagsSet: ["confidential-asset-ready"] },
      },
      {
        id: "reg-rushed",
        label: "Get it working, clean it up later",
        resultText: "It works. Kai's mouth does something that isn't quite a frown. He doesn't check it a second time.",
        delta: { character: { trustInPlayer: -2 }, characterId: "kai", flagsSet: ["confidential-asset-ready", "asset-setup-rushed"] },
      },
    ],
  },
  {
    id: "q1-01a",
    tier: 1,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "anyMatching", condition: { field: "confidence", op: "gte", value: 65 } },
    sceneText:
      "{character} catches a mismatched number in the numbers you were about to send a customer — an hour before the call.",
    choices: [
      {
        id: "credit-publicly",
        label: "Thank them properly, in front of everyone",
        resultText:
          "{character} lights up a little. Everyone else clocks it too — this is the kind of thing that gets noticed here.",
        delta: { character: { trustInPlayer: 8 }, world: { morale: 3 }, flagsSet: ["sharp-eyed"] },
      },
      {
        id: "credit-quietly",
        label: "Say thanks quietly, just between the two of you",
        resultText: "{character} nods. It stays small — but they know you saw it.",
        delta: { character: { trustInPlayer: 4 }, flagsSet: ["sharp-eyed"] },
      },
    ],
  },
  {
    id: "q1-01b",
    tier: 1,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    // 45, not 65 — the highest starting overwhelm (Theo, 50) already clears
    // this, and nothing in the game raises overwhelm before this storylet
    // could fire. A 65 threshold made this permanently unreachable, which
    // silently made Investor Confidence unobtainable too (it needs
    // mistake-owned, which only comes from q1-11, which only fires off the
    // flag this storylet sets).
    cast: { mode: "anyMatching", condition: { field: "overwhelm", op: "gte", value: 45 } },
    sceneText:
      "{character} notices something looks off in the numbers you're about to send a customer — but there's no time, and everyone's already stretched thin.",
    choices: [
      {
        id: "send-anyway",
        label: "Send it as-is, fix it after",
        resultText:
          "It goes out on time. {character} doesn't say anything else, but you catch them staring at the thread a beat too long.",
        delta: { world: { reputation: 4 }, flagsSet: ["sent-it-anyway"] },
      },
      {
        id: "hold-and-dig",
        label: "Hold the send, dig into it now",
        resultText:
          "You're five minutes late to the call, and it shows. But the numbers are right.",
        delta: { world: { reputation: -3 }, character: { overwhelm: 6 } },
      },
    ],
  },
  {
    id: "q1-02",
    tier: 0,
    trigger: [
      { kind: "quarter", op: "eq", value: 1 },
      { kind: "flagAbsent", has: "bell-built" },
    ],
    cast: { mode: "fixed", character: "theo" },
    sceneText:
      "Theo found a cheap desk bell at a hardware store. He wants to ring it every time you close something — starting with your first paying customer.",
    choices: [
      {
        id: "let-him-ring-it",
        label: "Let him ring it",
        resultText: "It's a little ridiculous. It's also the best sound in the office all week.",
        delta: {
          world: { morale: 4 },
          character: { confidence: 6 },
          characterId: "theo",
          flagsSet: ["bell-built", "bell-encouraged"],
        },
      },
      {
        id: "save-it-for-later",
        label: "Tell him to save it for something bigger",
        resultText: "He puts it back in the drawer. Fair enough — but something about the room goes a little quieter.",
        delta: { character: { confidence: -4 }, characterId: "theo", flagsSet: ["bell-built", "bell-delayed"] },
      },
    ],
  },
  {
    id: "q1-03",
    tier: 1,
    trigger: [
      { kind: "quarter", op: "eq", value: 1 },
      { kind: "flagAbsent", has: "contractor-terms-set" },
      { kind: "flag", has: "confidential-asset-ready" },
    ],
    cast: { mode: "fixed", character: "mara" },
    sceneText:
      "The contractor just finished the landing page — half her usual rate, because she liked what you're building. Mara wants to send flowers, practically. Priya, flatter: \"If the people she actually works for find out what she charged us, that's the story that follows her. Not the flowers. And the second that payment's traceable, our budget's readable right alongside it — what we pay, who we pay, how tight things actually are.\" Mara exhales. \"So we pay her. Properly. And none of that travels with it.\"",
    choices: [
      {
        id: "pay-generously-privately",
        label: "Pay her generously — and keep it between the two of you",
        resultText: "Mara's relieved someone's thinking about this the right way. Priya already has the details ready.",
        delta: {
          world: { runway: -6 },
          character: { trustInPlayer: 5 },
          characterId: "mara",
          flagsSet: ["contractor-terms-set", "contractor-generous"],
        },
      },
      {
        id: "pay-standard-privately",
        label: "Pay the agreed rate, keep it simple",
        resultText: "Fair, clean, no drama. Still has to happen quietly — that part was never optional.",
        delta: { world: { runway: -2 }, flagsSet: ["contractor-terms-set", "contractor-standard"] },
      },
    ],
  },
  {
    id: "q1-04",
    tier: 2,
    trigger: [
      { kind: "quarter", op: "eq", value: 1 },
      { kind: "flag", has: "contractor-terms-set" },
    ],
    cast: { mode: "fixed", character: "priya" },
    sceneText:
      "Priya's already got the wallet address pulled up. \"The second this hits an ordinary ledger, anyone can match the amount to her, to us, to the number Mara already told a reporter was coming.\" She looks at you. \"We still have to actually pay her. It just can't be readable that way.\"",
    mission: {
      engine: "operations",
      route: "/operations",
      actionSummary:
        "Send a single private payment to the contractor's wallet for the amount you decided on. Only she should ever know what she was paid.",
    },
    choices: [
      {
        id: "note-included",
        label: "Send a short personal note along with it",
        resultText: "She writes back almost immediately. It's the kind of reply you save.",
        delta: { world: { reputation: 3 }, character: { trustInPlayer: 6 }, flagsSet: ["contractor-felt-valued"] },
      },
      {
        id: "payment-only",
        label: "Let the payment do the talking",
        resultText: "Simple, professional, done. Priya marks it closed without needing to say anything.",
        delta: { character: { trustInPlayer: 3 } },
      },
    ],
  },
  {
    id: "q1-05",
    tier: 1,
    trigger: [
      { kind: "quarter", op: "eq", value: 1 },
      { kind: "flag", has: "contractor-terms-set" },
    ],
    cast: { mode: "fixed", character: "mara" },
    sceneText:
      "There's money for one thing this month, not both: the signup flow that's quietly been losing you real users, or the paid push Mara's already told someone was coming. \"It's not a big ask,\" she says, in the exact tone of someone who knows precisely how big an ask it is.",
    choices: [
      {
        id: "fix-signup",
        label: "Fix the signup flow",
        resultText: "Fewer people fall through the cracks now. Mara doesn't say much about it.",
        delta: { world: { reputation: 5 }, character: { confidence: -4 }, characterId: "mara", flagsSet: ["signup-fixed"] },
      },
      {
        id: "run-paid-push",
        label: "Run the paid push",
        resultText: "The number looks good this week. The signup flow is still broken underneath it.",
        delta: {
          world: { runway: -5, reputation: 3 },
          character: { confidence: 5, trustInPlayer: 4 },
          characterId: "mara",
          flagsSet: ["signup-still-broken"],
        },
      },
    ],
  },
  {
    id: "q1-06",
    tier: 2,
    // Deliberately ungated by reputation — this storylet is the only path to
    // the Airdrop Mission (see q1-air's trigger). A real Zama capability
    // shouldn't be reachable only on some playthroughs; every quarter gets
    // a reporter call eventually, regardless of how it's going.
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "fixed", character: "mara" },
    sceneText:
      "On a call with a reporter writing about early startups to watch, Mara mentions, almost offhand, that you're \"already rewarding your first power users\" — a program that doesn't exist yet. She messages you right after: \"BIG NEWS 🎉 (we might need to actually build this now, lol)\"",
    choices: [
      {
        id: "walk-it-back",
        label: "Ask her to walk it back before it publishes",
        resultText: "She does, a little deflated. The story runs smaller than she wanted.",
        delta: { world: { reputation: -2 }, character: { confidence: -6 }, characterId: "mara", flagsSet: ["mara-walked-back-once"] },
      },
      {
        id: "let-it-stand",
        label: "Let it stand — figure out how to make it true",
        resultText: "The story runs exactly as she said it. Now you owe someone a program that doesn't exist yet.",
        delta: {
          world: { reputation: 6, heat: 5 },
          character: { confidence: 5 },
          characterId: "mara",
          flagsSet: ["promise-power-user-rewards"],
        },
      },
    ],
  },
  {
    id: "q1-air",
    tier: 2,
    trigger: [
      { kind: "quarter", op: "eq", value: 1 },
      { kind: "flag", has: "promise-power-user-rewards" },
      { kind: "flag", has: "confidential-asset-ready" },
    ],
    cast: { mode: "fixed", character: "mara" },
    sceneText:
      "The story's live. Two people have already asked, publicly, where their reward is — in the same public thread everyone's watching. Mara's doing the math out loud, faster than usual. \"The second one person's amount is visible, everyone's comparing. The second they're comparable, people start asking for more before the first ones have even landed.\" She looks at you. \"We have to actually pay them. We just can't let the amounts turn into a leaderboard.\"",
    mission: {
      engine: "airdrop",
      route: "/airdrop",
      actionSummary: "Set up and fund the rewards campaign Mara already promised — real claims, real amounts, none of it comparable in public.",
    },
    choices: [
      {
        id: "air-generous",
        label: "Make it generous — cover everyone who asked, and then some",
        resultText: "It costs more than planned. Mara looks ten years younger for about an hour.",
        delta: { world: { runway: -5, reputation: 5 }, flagsSet: ["rewards-delivered", "rewards-generous"] },
      },
      {
        id: "air-modest",
        label: "Keep it modest, but real",
        resultText: "It's smaller than what she implied. It's also actually there, which is more than the story promised.",
        delta: { world: { runway: -2, reputation: 2 }, flagsSet: ["rewards-delivered"] },
      },
    ],
  },
  {
    id: "q1-07",
    tier: 2,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "fixed", character: "dana" },
    sceneText:
      "Dana wants a simple one-pager showing who owns what, shared with the whole team before the next board meeting — \"so nobody has to wonder.\" Kai, quietly, afterward: \"Wondering isn't the problem. People seeing exact numbers next to their name is.\"",
    choices: [
      {
        id: "back-dana",
        label: "Back Dana — share it openly",
        resultText: "Dana's satisfied. Kai doesn't say anything else about it, which is somehow worse than if he had.",
        delta: {
          character: { trustInPlayer: 6 },
          characterId: "dana",
          world: { reputation: 3, morale: -3 },
          flagsSet: ["openness-chosen-once"],
        },
      },
      {
        id: "back-kai",
        label: "Back Kai — keep it need-to-know",
        resultText: "Kai relaxes, just slightly. Dana's polite about it, but you feel the note she's making.",
        delta: {
          character: { trustInPlayer: -5 },
          characterId: "dana",
          world: { morale: 3 },
          flagsSet: ["privacy-chosen-once"],
        },
      },
    ],
  },
  {
    id: "q1-08",
    tier: 1,
    trigger: [
      { kind: "quarter", op: "eq", value: 1 },
      // 40, not 60 — Community Builder needs this storylet's testimonial-
      // public flag, and a genuinely pessimistic run (several morale-costing
      // choices in a row) could otherwise leave morale below the old
      // threshold for most of the quarter with no guaranteed way back up.
      { kind: "world", field: "morale", op: "gte", value: 40 },
    ],
    cast: { mode: "fixed", character: "priya" },
    sceneText:
      "A user posted, unprompted, that switching to your product saved her real hours this week. The team's already seen it. Priya asks if you want to do anything with it, or just let everyone enjoy it quietly.",
    choices: [
      {
        id: "share-wider",
        label: "Share it wider, with her okay",
        resultText: "It goes up on the site by afternoon. A few more people say similar things by the end of the week.",
        delta: { world: { reputation: 6 }, flagsSet: ["testimonial-public"] },
      },
      {
        id: "keep-it-internal",
        label: "Just let the team have this one",
        resultText: "No announcement. Just a good afternoon, which everyone quietly needed.",
        delta: { world: { morale: 6 } },
      },
    ],
  },
  {
    id: "q1-10",
    tier: 1,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "fixed", character: "theo" },
    sceneText:
      "Theo asks Kai to actually teach him how the claim logic works — \"not just where to click. How it works.\" Kai looks at him like nobody's asked him that in a while.",
    choices: [
      {
        id: "encourage-mentorship",
        label: "Tell Kai to actually take the time and teach him properly",
        resultText: "Kai spends the whole afternoon on it. Theo doesn't stop talking about it for a week.",
        delta: { character: { confidence: 6 }, characterId: "theo", world: { morale: 3 }, flagsSet: ["kai-mentored-theo"] },
      },
      {
        id: "not-this-week",
        label: "Tell Theo it's not the best week for it",
        resultText: "He nods, a little deflated, and goes back to his desk.",
        delta: { character: { confidence: -4 }, characterId: "theo", flagsSet: ["theo-brushed-off"] },
      },
    ],
  },
  {
    id: "q1-11",
    tier: 2,
    trigger: [
      { kind: "quarter", op: "eq", value: 1 },
      { kind: "flag", has: "sent-it-anyway" },
    ],
    cast: { mode: "fixed", character: "priya" },
    sceneText:
      "The numbers that went out wrong finally landed somewhere — a customer, confused, polite, asking why their invoice doesn't match what they were quoted. Priya already has a draft open. \"I can make this go away quietly, or you can make it go away better. Your call.\"",
    choices: [
      {
        id: "own-it-personally",
        label: "Call them yourself. Own it.",
        resultText: "The call's uncomfortable for about ninety seconds, then it isn't. They actually thank you for calling.",
        delta: { world: { reputation: 4, runway: -2 }, flagsSet: ["mistake-owned"] },
      },
      {
        id: "let-priya-handle-it",
        label: "Let Priya handle it in writing",
        resultText: "It gets resolved, technically. The reply is polite. Nobody's thrilled.",
        delta: { world: { reputation: -2, heat: 3 } },
      },
    ],
  },
  // ── Callback payoffs — flags set earlier finally get answered ──────────
  {
    id: "q1-12",
    tier: 1,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "contractor-generous" }],
    cast: { mode: "fixed", character: "mara" },
    sceneText:
      "The contractor emails, unprompted: she's got a friend launching something who needs exactly what you do, and she'd love to introduce you. Mara reads it twice before saying anything.",
    choices: [
      {
        id: "take-the-intro",
        label: "Take the introduction",
        resultText: "Twenty minutes later there's a call on the calendar. Mara hasn't stopped smiling.",
        delta: { world: { reputation: 5 }, flagsSet: ["referral-taken"] },
      },
      {
        id: "say-thanks-only",
        label: "Say thank you, leave it there for now",
        resultText: "Mara looks like she wants to argue, then doesn't.",
        delta: { character: { confidence: -2 }, characterId: "mara" },
      },
    ],
  },
  {
    id: "q1-13",
    tier: 0,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "contractor-standard" }],
    cast: { mode: "fixed", character: "priya" },
    sceneText:
      "Priya mentions the contractor left a short, polite review somewhere. Nothing special. Fair, professional, forgettable.",
    choices: [
      {
        id: "thats-fine",
        label: "That's fine — not every relationship needs to be a big one",
        resultText: "Priya shrugs, agrees, moves on to the next thing.",
        delta: { world: { morale: 2 } },
      },
      {
        id: "wish-it-were-more",
        label: "Wish out loud it had gone further",
        resultText: "\"It went how it went,\" Priya says, a little flat.",
        delta: { character: { trustInPlayer: -2 }, characterId: "priya" },
      },
    ],
  },
  {
    id: "q1-14",
    tier: 2,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "signup-still-broken" }],
    cast: { mode: "fixed", character: "mara" },
    sceneText:
      "A user churns and says exactly why in the exit survey: the same signup issue that's been sitting there for weeks. Mara forwards it to you without a note, which somehow says more than a note would.",
    choices: [
      {
        id: "fix-it-now",
        label: "Drop everything and fix it today",
        resultText: "It takes four hours. It should have taken four hours in Q1's first week.",
        delta: { world: { runway: -3, reputation: 2 }, flagsSet: ["signup-fixed-late"] },
      },
      {
        id: "schedule-it",
        label: "Add it to the list. Again.",
        resultText: "Mara doesn't say anything. She doesn't have to.",
        delta: { character: { trustInPlayer: -5 }, characterId: "mara" },
      },
    ],
  },
  {
    id: "q1-15",
    tier: 0,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "signup-fixed" }],
    cast: { mode: "fixed", character: "kai" },
    sceneText:
      "Kai mentions, almost in passing, that signup completion is up since the fix. He doesn't make it a bigger deal than it is. It's still a big deal.",
    choices: [
      {
        id: "acknowledge-it",
        label: "Tell him that mattered",
        resultText: "He nods once. From Kai, that's practically a parade.",
        delta: { character: { trustInPlayer: 5 }, characterId: "kai" },
      },
      {
        id: "move-on",
        label: "Just move on to the next thing",
        resultText: "He does too. It's fine. It was never about the credit.",
        delta: {},
      },
    ],
  },
  {
    id: "q1-16",
    tier: 2,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "openness-chosen-once" }],
    cast: { mode: "fixed", character: "dana" },
    sceneText:
      "Dana, encouraged by how the equity sheet went over, wants to take it further — publish more internally, maybe even a version for investors. Kai hasn't said anything, which is exactly the problem.",
    choices: [
      {
        id: "go-further",
        label: "Back Dana again — go further",
        resultText: "Dana's pleased. Kai starts keeping his camera off in meetings. Nobody mentions it.",
        delta: { character: { trustInPlayer: 6 }, characterId: "dana", world: { morale: -4 }, flagsSet: ["openness-escalated"] },
      },
      {
        id: "hold-the-line",
        label: "Tell Dana this is as far as it goes",
        resultText: "She's not thrilled, but she respects that you have a line at all.",
        delta: { character: { trustInPlayer: -3 }, characterId: "dana", world: { morale: 3 } },
      },
    ],
  },
  {
    id: "q1-17",
    tier: 1,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "privacy-chosen-once" }],
    cast: { mode: "fixed", character: "kai" },
    sceneText:
      "Kai stops by your desk, which he basically never does. \"Thanks for that, with Dana.\" That's it. That's the whole visit. He's already walking away before you can respond properly.",
    choices: [
      {
        id: "say-it-mattered",
        label: "Tell him it wasn't a big deal",
        resultText: "\"It was to me,\" he says, not looking back.",
        delta: { character: { trustInPlayer: 6 }, characterId: "kai" },
      },
      {
        id: "just-nod",
        label: "Just nod",
        resultText: "He nods back. Somehow that's enough for both of you.",
        delta: { character: { trustInPlayer: 4 }, characterId: "kai" },
      },
    ],
  },
  {
    id: "q1-18",
    tier: 1,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "kai-mentored-theo" }],
    cast: { mode: "fixed", character: "theo" },
    sceneText:
      "Theo catches a real problem in the claim logic before it ships — the exact kind of thing Kai taught him to look for. He's trying very hard to act like this is normal for him.",
    choices: [
      {
        id: "make-a-thing-of-it",
        label: "Make sure Kai hears about this one",
        resultText: "Kai's response is one word — \"Good\" — and Theo will be telling this story for a month.",
        delta: { character: { confidence: 8 }, characterId: "theo", world: { morale: 3 } },
      },
      {
        id: "keep-it-low-key",
        label: "Thank him quietly, keep it low-key",
        resultText: "He seems almost relieved not to make a thing of it. He's still grinning at his desk an hour later.",
        delta: { character: { confidence: 5 }, characterId: "theo" },
      },
    ],
  },
  {
    id: "q1-vest",
    tier: 1,
    // Deliberately not gated on kai-mentored-theo — that flag only decides
    // which finale variant plays later. A real Mission demonstrating FHE
    // vesting shouldn't hinge on an unrelated, easily-missed earlier choice.
    trigger: [
      { kind: "quarter", op: "eq", value: 1 },
      { kind: "flag", has: "confidential-asset-ready" },
    ],
    cast: { mode: "fixed", character: "dana" },
    sceneText:
      "Dana brings it up like a formality, which is how she brings up things she actually cares about: Theo's been doing real work for months on a handshake. \"That should be on paper. Properly. Before it isn't.\" Theo, overhearing, goes quiet a beat too long. \"Can it just... be mine? I don't need everyone doing math on what I'm worth compared to everyone else.\" Dana doesn't even blink. \"That's exactly why it won't be a spreadsheet.\"",
    mission: {
      engine: "vesting",
      route: "/vesting",
      actionSummary: "Set up a real vesting schedule for Theo — equity that's been informal for too long, made properly his, and nobody else's business.",
    },
    choices: [
      {
        id: "vest-generous",
        label: "Set it up generously — he's earned it",
        resultText: "Theo doesn't say anything for a second. Then he says thank you about four times.",
        delta: { character: { confidence: 8 }, characterId: "theo", world: { morale: 4 }, flagsSet: ["vesting-formalized", "vesting-generous"] },
      },
      {
        id: "vest-standard",
        label: "Set up the standard schedule",
        resultText: "It's fair. Theo says it's more than fair. He's probably underselling how much it means to him.",
        delta: { character: { confidence: 4 }, characterId: "theo", flagsSet: ["vesting-formalized"] },
      },
    ],
  },
  // ── WOW moments — emotional payoffs for what the missions actually did.
  // All three are guaranteed reachable: q1-reveal off vesting-formalized (set
  // by either q1-vest choice), q1-kai-system off q1-reveal itself, and
  // q1-mara-announce off rewards-delivered (set by either q1-air choice).
  // None of them explain the tech — they just let a character feel it.
  {
    id: "q1-reveal",
    tier: 2,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "vesting-formalized" }],
    cast: { mode: "fixed", character: "theo" },
    sceneText:
      "Theo's been staring at his laptop for two full minutes without touching it. When you look over, he turns the screen toward you — just for a second, just enough. His actual number. Nobody else in the building could pull that same screen up, not Mara, not you, no one who wasn't supposed to. \"That's... that's actually mine,\" he says, like he's checking it's real before he lets himself believe it.",
    choices: [
      {
        id: "let-him-have-it",
        label: "Don't say anything. Let him have the moment.",
        resultText: "You don't have to say anything. He closes the laptop like it's something worth protecting.",
        delta: { character: { confidence: 6 }, characterId: "theo", flagsSet: ["theo-reveal-witnessed"] },
      },
      {
        id: "ask-what-it-feels-like",
        label: "Ask him what it feels like",
        resultText: "\"Like the first thing that was ever just... mine, without an asterisk,\" he says. He's still a little stunned by it an hour later.",
        delta: { character: { confidence: 8 }, characterId: "theo", world: { morale: 2 }, flagsSet: ["theo-reveal-witnessed"] },
      },
    ],
  },
  {
    id: "q1-kai-system",
    tier: 2,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "theo-reveal-witnessed" }],
    cast: { mode: "fixed", character: "kai" },
    sceneText:
      "Kai watched the whole thing from his desk without seeming to. \"You know what's actually different,\" he says, mostly to himself. \"It's not that people can't see it. It's that nobody has to promise they won't look. The math already decided that part.\" He doesn't say Dana's name. He doesn't have to.",
    choices: [
      {
        id: "kai-nod",
        label: "Just nod. Let him sit with it.",
        resultText: "He does, for a while. It's the most at ease you've seen him look all quarter.",
        delta: { character: { trustInPlayer: 5 }, characterId: "kai" },
      },
      {
        id: "kai-agree-aloud",
        label: "Tell him that's the whole point",
        resultText: "\"Yeah,\" he says. \"Wish someone had put it that plainly months ago.\"",
        delta: { character: { trustInPlayer: 7 }, characterId: "kai" },
      },
    ],
  },
  {
    id: "q1-mara-announce",
    tier: 2,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "rewards-delivered" }],
    cast: { mode: "fixed", character: "mara" },
    sceneText:
      "Mara's rereading the thread where people found out they'd been rewarded before anyone found out how much. She looks almost giddy about it. \"I got to actually tell people something's happening,\" she says, \"without it turning into everyone doing math on each other's numbers in the replies. I didn't think that was a version of true I was allowed to have.\"",
    choices: [
      {
        id: "tell-her-thats-the-point",
        label: "Tell her that's the whole point",
        resultText: "\"I know,\" she says, grinning anyway. \"Let me have it for one afternoon.\"",
        delta: { world: { morale: 3 }, character: { trustInPlayer: 3 }, characterId: "mara" },
      },
      {
        id: "let-her-enjoy-it",
        label: "Let her enjoy it without picking it apart",
        resultText: "You don't say anything clever. She doesn't need you to. She's already back on her laptop, smiling at nothing in particular.",
        delta: { world: { morale: 2 } },
      },
    ],
  },
  {
    id: "q1-19",
    tier: 2,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "theo-brushed-off" }],
    cast: { mode: "fixed", character: "theo" },
    sceneText:
      "Theo tried to fix something himself rather than ask again — the thing he wanted Kai to teach him. He got it mostly right. Mostly. Now there's a small mess, and he's the one who has to tell you about it.",
    choices: [
      {
        id: "help-him-fix-it",
        label: "Help him fix it together, no lecture",
        resultText: "It takes twenty minutes. He apologizes twice. You tell him once is plenty.",
        delta: { character: { confidence: 3, overwhelm: -2 }, characterId: "theo", flagsSet: ["theo-protected"] },
      },
      {
        id: "let-him-solve-it",
        label: "Let him solve it on his own",
        resultText: "He does, eventually. It takes longer than it needed to, and he looks a little shaken by the end of it.",
        delta: { character: { confidence: -3, overwhelm: 6 }, characterId: "theo" },
      },
    ],
  },
  {
    id: "q1-20",
    tier: 0,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "testimonial-public" }],
    cast: { mode: "fixed", character: "mara" },
    sceneText:
      "A second customer says something nice, also unprompted. Mara wants to put both quotes in the deck she's building for the next round of conversations.",
    choices: [
      {
        id: "let-her-use-it",
        label: "Let her use both",
        resultText: "She's already dropping them into a slide before you finish answering.",
        delta: { world: { reputation: 3 } },
      },
      {
        id: "check-with-them-first",
        label: "Ask her to check with the customers first",
        resultText: "She does. Both say yes. It takes an extra day and nobody minds.",
        delta: { world: { reputation: 2 }, character: { trustInPlayer: 3 }, characterId: "mara" },
      },
    ],
  },
  // ── New dilemmas — fresh scarce-resource situations, not callbacks ──────
  {
    id: "q1-21",
    tier: 1,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "fixed", character: "priya" },
    sceneText:
      "Two customers need real hand-holding today, and there's only time for one. One's been with you since week one, never asks for much. The other's bigger, richer, and still deciding if signing with you was a mistake. Priya doesn't say which one she thinks it should be. She doesn't have to.",
    choices: [
      {
        id: "help-the-loyal-one",
        label: "Help the one who's been with you from the start",
        resultText: "She notices. The bigger customer waits until tomorrow, a little less patiently.",
        delta: { character: { trustInPlayer: 4 }, characterId: "priya", world: { reputation: -2 } },
      },
      {
        id: "help-the-bigger-one",
        label: "Prioritize the bigger customer",
        resultText: "It's the right business call. It doesn't feel like the right call to the person who waited.",
        delta: { world: { reputation: 3, morale: -2 } },
      },
    ],
  },
  {
    id: "q1-22",
    tier: 2,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "world", field: "runway", op: "lte", value: 80 }],
    cast: { mode: "fixed", character: "mara" },
    sceneText:
      "A genuinely marquee customer will sign today, but only at a steep discount — enough that Mara can already picture using the logo everywhere. Enough that it barely covers what it costs to serve them.",
    choices: [
      {
        id: "take-the-discount",
        label: "Take the deal — the logo is worth it",
        resultText: "It closes within the hour. It looks fantastic on the site. The math is quietly worse than it looks.",
        delta: { world: { reputation: 6, runway: -6 }, character: { confidence: 6 }, characterId: "mara" },
      },
      {
        id: "partial-discount",
        label: "Counter with a smaller discount",
        resultText: "It's a longer negotiation. They still sign. It costs less than it would have.",
        delta: { world: { reputation: 3, runway: -2 } },
      },
      {
        id: "walk-away",
        label: "Walk away from this one",
        resultText: "Mara doesn't love it. The numbers are cleaner without it, and there'll be another one.",
        delta: { world: { runway: 2 }, character: { confidence: -5 }, characterId: "mara" },
      },
    ],
  },
  {
    id: "q1-23",
    tier: 2,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flagAbsent", has: "openness-escalated" }],
    cast: { mode: "fixed", character: "dana" },
    sceneText:
      "It finally happens in the open — Dana and Kai, mid-hallway, not quite arguing but not far off. \"I'm not trying to expose anyone,\" Dana says. \"I'm trying to make sure nobody has to.\" Kai doesn't answer. Both of them look at you.",
    choices: [
      {
        id: "back-dana-here",
        label: "Tell them Dana's instinct is right this time",
        resultText: "Kai walks away without a word. Dana looks relieved, and a little uneasy about being relieved.",
        delta: { character: { trustInPlayer: 5 }, characterId: "dana", world: { morale: -3 } },
      },
      {
        id: "back-kai-here",
        label: "Tell them Kai gets to keep his line",
        resultText: "Dana nods, more gracefully than you expected. \"Noted,\" is all she says.",
        delta: { character: { trustInPlayer: -4 }, characterId: "dana", world: { morale: 2 } },
      },
      {
        id: "neither-yet",
        label: "Say you need to actually think about this one",
        resultText: "Neither of them loves that answer. Both of them respect it a little.",
        delta: { world: { heat: 2 }, flagsSet: ["hidden-story-neither"] },
      },
    ],
  },
  {
    id: "q1-24",
    tier: 1,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "fixed", character: "theo" },
    sceneText:
      "Theo wants to answer an angry customer himself — no draft review, no heads up, before anyone else even reads the complaint. \"I've got this,\" he says, already halfway back to his desk.",
    choices: [
      {
        id: "let-him-send-it",
        label: "Let him send it his way",
        resultText: "It's a little too casual, but it lands fine. He's proud of himself for the rest of the day.",
        delta: { character: { confidence: 5 }, characterId: "theo", world: { reputation: 1 } },
      },
      {
        id: "review-it-first",
        label: "Ask to see it before it goes out",
        resultText: "You fix two lines. He watches which two, carefully, like he's taking notes without a notebook.",
        delta: { character: { confidence: 2 }, characterId: "theo", world: { reputation: 3 } },
      },
    ],
  },
  {
    id: "q1-25",
    tier: 2,
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "world", field: "reputation", op: "gte", value: 45 }],
    cast: { mode: "fixed", character: "mara" },
    sceneText:
      "A company twice your size wants to talk about something bigger than a normal deal. \"This is the one,\" Mara says — the same way she's said it about four other things this quarter. It would mean saying yes to a timeline nobody's confirmed you can hit.",
    choices: [
      {
        id: "swing-for-it",
        label: "Say yes and figure out the timeline after",
        resultText: "Mara's thrilled. The team finds out the deadline exists before they find out it's real.",
        delta: { world: { reputation: 6, heat: 4 }, character: { confidence: 8 }, characterId: "mara" },
      },
      {
        id: "negotiate-timeline-first",
        label: "Get a realistic timeline on paper before saying yes",
        resultText: "It takes an extra round of calls. Mara's a little impatient. The deal survives it fine.",
        delta: { world: { reputation: 4 }, character: { confidence: 3 }, characterId: "mara" },
      },
    ],
  },
  // ── Finale variants — deferred by the engine until nothing else is left.
  // More specific closings take priority over the generic one below simply
  // by appearing earlier in this array; the engine doesn't need to know why.
  {
    id: "q1-09-kai",
    tier: 1,
    isEpisodeEnd: true,
    trigger: [
      { kind: "quarter", op: "eq", value: 1 },
      { kind: "flag", has: "contractor-terms-set" },
      { kind: "flag", has: "privacy-chosen-once" },
      { kind: "flag", has: "kai-mentored-theo" },
    ],
    cast: { mode: "fixed", character: "kai" },
    sceneText:
      "Kai's the one who stays late to say something, which is its own small event. \"You did alright this quarter,\" he says. \"I mean it.\" It's not a lot of words. From him, it's most of a speech.",
    choices: [
      {
        id: "kai-same-time",
        label: "Same time next quarter.",
        resultText: "He almost smiles. Almost. \"Yeah. Okay.\"",
        delta: { world: { morale: 6 }, character: { trustInPlayer: 6 }, characterId: "kai", flagsSet: ["episode-complete"] },
      },
      {
        id: "kai-bigger",
        label: "Let's make next quarter bigger.",
        resultText: "\"Sure,\" he says. \"Just don't make it bigger in a way that breaks something.\"",
        delta: { world: { reputation: 3 }, flagsSet: ["q2-big-ambitions", "episode-complete"] },
      },
    ],
  },
  {
    id: "q1-09-dana",
    tier: 1,
    isEpisodeEnd: true,
    trigger: [
      { kind: "quarter", op: "eq", value: 1 },
      { kind: "flag", has: "contractor-terms-set" },
      { kind: "flag", has: "openness-chosen-once" },
    ],
    cast: { mode: "fixed", character: "dana" },
    sceneText:
      "Dana stops by before heading out, which she doesn't usually do. \"You kept this place honest this quarter,\" she says. \"I noticed. That matters more than it sounds like it should.\"",
    choices: [
      {
        id: "dana-same-time",
        label: "Same time next quarter.",
        resultText: "\"Same time,\" she agrees, already checking her phone on the way to the door.",
        delta: { world: { morale: 4 }, character: { trustInPlayer: 5 }, characterId: "dana", flagsSet: ["episode-complete"] },
      },
      {
        id: "dana-bigger",
        label: "Let's make next quarter bigger.",
        resultText: "\"Good,\" she says. \"The board will like hearing that. So will I, honestly.\"",
        delta: { world: { reputation: 4, heat: 2 }, flagsSet: ["q2-big-ambitions", "episode-complete"] },
      },
    ],
  },
  {
    id: "q1-09",
    tier: 1,
    isEpisodeEnd: true,
    trigger: [
      { kind: "quarter", op: "eq", value: 1 },
      { kind: "flag", has: "contractor-terms-set" },
    ],
    cast: { mode: "fixed", character: "priya" },
    sceneText:
      "It's been a real quarter — the kind where you can't point to one big thing, just a hundred small decisions that added up. Priya, at the end of a long day: \"We made it. Barely. Same time next quarter?\"",
    choices: [
      {
        id: "same-time-next-quarter",
        label: "Same time next quarter.",
        resultText: "She laughs, actually laughs, for the first time in a week.",
        delta: { world: { morale: 5 }, character: { trustInPlayer: 4 }, flagsSet: ["episode-complete"] },
      },
      {
        id: "make-q2-bigger",
        label: "Let's make next quarter bigger.",
        resultText: "She raises an eyebrow — not disagreeing, just noting it. \"Okay. Bigger, then.\"",
        delta: { world: { reputation: 3, heat: 2 }, flagsSet: ["q2-big-ambitions", "episode-complete"] },
      },
    ],
  },
];
