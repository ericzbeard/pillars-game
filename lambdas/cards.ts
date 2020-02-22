/**
 * This is the master card database.
 * 
 * Need to decide where to store it...
 * 
 * What happens when we make a change while a game is in progress?
 * What if we remove a card?
 * Should we snapshot the card database for each game so it remains stable?
 * 
 * The client should have a copy of this locally for quick presentation, but 
 * we need to make all state changed server-side. Clients might just have 
 * an array of images instead of the actual data.
 * 
 * Should probably have an S3 folder for each version of the game.
 * 
 * What about expansions?
 */
const db = {
    version: "0.5",
    cards: [
        {
            name: "EC2 Instance",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{$}",
            text: "<em>(Provides 1 Credit)</em>",
            starter: true,
            copies: 12,
            category: "Compute"
        },
        {
            name: "Junior Developer",
            type: "Resource",
            subtype: "Human",
            bigtext: "{T}",
            text: "<em>(Provides 1 Talent)</em>",
            starter: true,
            copies: 12
        },
        {
            name: "Cloud Support",
            type: "Resource",
            subtype: "Human",
            bigtext: "{Cr}",
            text: "<em>(Provides 1 Creativity)</em>",
            starter: true,
            copies: 8,
            flavor: "You do have a support contract, don't you?"
        },
        {
            name: "Sandbox Credit",
            type: "Resource",
            subtype: "Augment Cloud",
            bigtext: "{$}",
            text: "<em>(Provides 1 Credit)</em><br/>You must have a cloud resource to play this card",
            starter: true,
            copies: 4
        },
        {
            name: "Training",
            type: "Resource",
            subtype: "Augment Human",
            bigtext: "{T}",
            text: "<em>(Provides 1 Talent)</em><br/>You must have a human resource to play this card",
            starter: true,
            copies: 4
        },
        {
            name: "Decommision",
            type: "Resource",
            subtype: "Action",
            bigtext: "Retire 1",
            text: "<em>(Retire 1 from your hand)</em><br/>Or Retire this card and add one Credit",
            starter: true,
            copies: 4
        },
        {
            name: "Get Certified",
            type: "Resource",
            subtype: "Action",
            bigtext: "Promote",
            text: "<em>(Roll a d6 and promote that pillar. On a 6, you choose.)</em>",
            starter: true,
            copies: 4
        },
        {
            name: "DDoS Attack",
            type: "Trial",
            subtype: "Phase 1",
            bigtext: "7",
            text: "",
            success: "+2 Customers<br/>You may retire a card you played this turn.",
            fail: "-1 Customer",
            starter: false,
            copies: 1,
            flavor: "Our site is getting a ton of unique visitors today! Wait a minute... Uh Oh..."
        },
        {
            name: "Unrealistic Deadline",
            type: "Trial",
            subtype: "Phase 1",
            bigtext: "6",
            text: "",
            success: "+1 Customer<br/>Promote",
            fail: "Demote",
            starter: false,
            copies: 1
        },
        {
            name: "No Sales Pipeline",
            type: "Trial",
            subtype: "Phase 1",
            bigtext: "7",
            text: "",
            success: "+2 Customers<br />Promote",
            fail: "-1 Customer",
            starter: false,
            copies: 1
        },
        {
            name: "Talent Shortage",
            type: "Trial",
            subtype: "Phase 1",
            bigtext: "6",
            text: "",
            success: "+1 Customer",
            fail: "Draw 1 less card at the end of this turn",
            starter: false,
            copies: 1
        },
        {
            name: "Hack Attempt",
            type: "Trial",
            subtype: "Phase 1",
            bigtext: "7",
            text: "",
            success: "+1 Customer<br/>Promote &#8544;",
            fail: "-1 Customer",
            starter: false,
            copies: 1
        },
        {
            name: "Bug Reports",
            type: "Trial",
            subtype: "Phase 1",
            bigtext: "7",
            text: "",
            success: "+1 Customer<br/>Promote II",
            fail: "-1 Customer",
            starter: false,
            copies: 1
        },
        {
            name: "Slow Website",
            type: "Trial",
            subtype: "Phase 1",
            bigtext: "7",
            text: "",
            success: "+1 Customer<br/>Promote III",
            fail: "-1 Customer",
            starter: false,
            copies: 1
        },
        {
            name: "License Fee Increase",
            type: "Trial",
            subtype: "Phase 1",
            bigtext: "7",
            text: "",
            success: "+1 Customer<br/>Promote &#8547;",
            fail: "-1 Customer",
            starter: false,
            copies: 1
        },
        {
            name: "Competitive Threat",
            type: "Trial",
            subtype: "Phase 1",
            bigtext: "5",
            text: "",
            success: "+2 Customers",
            fail: "-1 Customer",
            starter: false,
            copies: 1
        },
        {
            name: "Monolithic Architecture",
            type: "Trial",
            subtype: "Phase 1",
            bigtext: "8",
            text: "",
            success: "+2 Customers<br/>Promote Any",
            fail: "Demote",
            starter: false,
            copies: 1
        },
        {
            name: "Application Rewrite",
            type: "Trial",
            subtype: "Phase 2",
            bigtext: "8",
            text: "",
            success: "+3 Customers",
            fail: "-2 Customers",
            starter: false,
            copies: 1
        },
        {
            name: "Outdated Technology",
            type: "Trial",
            subtype: "Phase 2",
            bigtext: "8",
            text: "",
            success: "+2 Customers<br/>Promote",
            fail: "Demote",
            starter: false,
            copies: 1
        },
        {
            name: "Throttled Bandwidth",
            type: "Trial",
            subtype: "Phase 2",
            bigtext: "9",
            text: "If you have any cards in play that provide Creativity, place one of them in the discard pile before rolling",
            success: "+2 Customers<br/>Promote",
            fail: "-1 Customer",
            starter: false,
            copies: 1
        },
        {
            name: "Security Incident",
            type: "Trial",
            subtype: "Phase 2",
            bigtext: "11",
            text: "Add Creativity * &#8544; to your roll",
            success: "+3 Customers<br/>Promote I",
            fail: "-1 Customer",
            starter: false,
            copies: 1
        },
        {
            name: "Fire at HQ",
            type: "Trial",
            subtype: "Phase 2",
            bigtext: "11",
            text: "Add Creativity * &#8545; to your roll",
            success: "+3 Customers<br/>Promote II",
            fail: "-1 Customer",
            starter: false,
            copies: 1,
            flavor: "I told you that was my red stapler."
        },
        {
            name: "Latency",
            type: "Trial",
            subtype: "Phase 2",
            bigtext: "11",
            text: "Add Creativity * &#8546; to your roll",
            success: "+3 Customers<br />Promote III",
            fail: "-1 Customer",
            starter: false,
            copies: 1
        },
        {
            name: "Cash Flow Issues",
            type: "Trial",
            subtype: "Phase 2",
            bigtext: "11",
            text: "Add Creativity * &#8547; to your roll",
            success: "+3 Customers<br />Promote &#8547;",
            fail: "-1 Customer",
            starter: false,
            copies: 1
        },
        {
            name: "Server Crash",
            type: "Trial",
            subtype: "Phase 2",
            bigtext: "11",
            text: "Add Creativity * &#8548; to your roll",
            success: "+3 Customers<br />Promote&#8548;",
            fail: "-1 Customer",
            starter: false,
            copies: 1
        },
        {
            name: "Data Center Migration",
            type: "Trial",
            subtype: "Phase 2",
            bigtext: "10",
            text: "",
            success: "+1 Customer<br/>Promote your lowest pillars",
            fail: "-1 Customer<br />Demote",
            starter: false,
            copies: 1
        },
        {
            name: "Employees Poached",
            type: "Trial",
            subtype: "Phase 2",
            bigtext: "11",
            text: "",
            success: "Acquire a resource card from the market for free",
            fail: "Demote twice",
            starter: false,
            copies: 1
        },
        {
            name: "Single Point of Failure",
            type: "Trial",
            subtype: "Phase 3",
            bigtext: "13",
            text: "You must retire a resource in play that provides Creativity or subtract 2 from your roll",
            success: "+3 Customers<br/>Promote&#8548;",
            fail: "-2 Customers",
            starter: false,
            copies: 1
        },
        {
            name: "Bad Press",
            type: "Trial",
            subtype: "Phase 3",
            bigtext: "11",
            text: "",
            success: "+4 Customers",
            fail: "-2 Customers",
            starter: false,
            copies: 1
        },
        {
            name: "Rogue Employee",
            type: "Trial",
            subtype: "Phase 3",
            bigtext: "12",
            text: "Subtract 1 from your roll if your pillar &#8544; is not maxed",
            success: "+4 Customers<br/>Promote Any",
            fail: "-2 Cusotomers<br/>Demote",
            starter: false,
            copies: 1
        },
        {
            name: "Failed Rollback",
            type: "Trial",
            subtype: "Phase 3",
            bigtext: "12",
            text: "Subtract 1 from your roll if your pillar &#8545; is not maxed",
            success: "+4 Customers<br/>Promote Any",
            fail: "-1 Cusotomer<br/>Demote",
            starter: false,
            copies: 1
        },
        {
            name: "Deadlocks",
            type: "Trial",
            subtype: "Phase 3",
            bigtext: "12",
            text: "Subtract 1 from your roll if your pillar &#8546; is not maxed",
            success: "+4 Customers<br/>Promote Any",
            fail: "-1 Cusotomer<br/>Demote",
            starter: false,
            copies: 1
        },
        {
            name: "Service Limits",
            type: "Trial",
            subtype: "Phase 3",
            bigtext: "12",
            text: "Subtract 1 from your roll if your pillar &#8547; is not maxed",
            success: "+4 Customers<br/>Promote Any",
            fail: "-1 Cusotomer<br/>Demote",
            starter: false,
            copies: 1
        },
        {
            name: "Segmentation Fault",
            type: "Trial",
            subtype: "Phase 3",
            bigtext: "12",
            text: "Subtract 1 from your roll if your pillar &#8548; is not maxed",
            success: "+4 Customers<br/>Promote Any",
            fail: "-1 Cusotomer<br/>Demote",
            starter: false,
            copies: 1
        },
        {
            name: "Unpatched OS",
            type: "Trial",
            subtype: "Phase 3",
            bigtext: "13",
            text: "+2 to your roll if you spent at least one Credit and at least one Talent this turn",
            success: "+2 Customers<br/>Promote twice",
            fail: "Demote your highest non-maxed Pillar",
            starter: false,
            copies: 1
        },
        {
            name: "Technology Disruption",
            type: "Trial",
            subtype: "Phase 3",
            bigtext: "14",
            text: "+2 Creativity for each of your maxed pillars",
            success: "+1 Customer<br/>Acquire a card from an opponent's discard pile",
            fail: "Opponents may put a card from their hand into your discard pile",
            starter: false,
            copies: 1
        },
        {
            name: "Legal Battle",
            type: "Trial",
            subtype: "Phase 3",
            bigtext: "15",
            text: "Add Creativity to your roll equal to your lowest pillar",
            success: "+1 Customer<br/>Max one non-maxed pillar",
            fail: "The opponent to your right demotes any one of your non-maxed pillars",
            starter: false,
            copies: 1
        },
        {
            name: "Security",
            type: "Pillar",
            subtype: "",
            bigtext: "&#8544;",
            text: "",
            cost: "",
            pillar: true,
            starter: false,
            copies: 1
        },
        {
            name: "Operational Excellence",
            type: "Pillar",
            subtype: "",
            bigtext: "&#8545;",
            text: "",
            cost: "",
            pillar: true,
            starter: false,
            copies: 1
        },
        {
            name: "Performance Efficiency",
            type: "Pillar",
            subtype: "",
            bigtext: "&#8546;",
            text: "",
            cost: "",
            pillar: true,
            starter: false,
            copies: 1
        },
        {
            name: "Cost Optimization",
            type: "Pillar",
            subtype: "",
            bigtext: "&#8547;",
            text: "",
            cost: "",
            pillar: true,
            starter: false,
            copies: 1
        },
        {
            name: "Reliability",
            type: "Pillar",
            subtype: "",
            bigtext: "&#8548;",
            text: "",
            cost: "",
            pillar: true,
            starter: false,
            copies: 1
        },
        {
            name: "Planning Session",
            type: "Resource",
            subtype: "Event",
            bigtext: "Draw 2",
            text: "",
            cost: "TTT",
            starter: false,
            copies: 2
        },
        {
            name: "Account Manager",
            type: "Resource",
            subtype: "Human",
            bigtext: "{$}{$}",
            text: "<em>(Provides 2 Credits)</em>",
            cost: "$T",
            starter: false,
            copies: 3
        },
        {
            name: "Security Workshop",
            type: "Resource",
            subtype: "Event",
            bigtext: "Draw 1",
            text: "Or Draw 2 if you have 4+ on pillar &#8544;",
            cost: "$T",
            starter: false,
            copies: 1
        },
        {
            name: "Ops Workshop",
            type: "Resource",
            subtype: "Event",
            bigtext: "Draw 1",
            text: "Or Draw 2 if you have 4+ on pillar &#8545;",
            cost: "$T",
            starter: false,
            copies: 1
        },
        {
            name: "Performance Workshop",
            type: "Resource",
            subtype: "Event",
            bigtext: "Draw 1",
            text: "Or Draw 2 if you have 4+ on pillar &#8546;",
            cost: "$T",
            starter: false,
            copies: 1
        },
        {
            name: "Budget Workshop",
            type: "Resource",
            subtype: "Event",
            bigtext: "Draw 1",
            text: "Or Draw 2 if you have 4+ on pillar &#8547;",
            cost: "$T",
            starter: false,
            copies: 1
        },
        {
            name: "Reliability Workshop",
            type: "Resource",
            subtype: "Event",
            bigtext: "Draw 1",
            text: "Or Draw 2 if you have 4+ on pillar &#8548;",
            cost: "$T",
            starter: false,
            copies: 1
        },
        {
            name: "Access Control List",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{$}*&#8544;",
            text: "<em>(Provides Credits equal to your pillar &#8544;)</em>",
            cost: "$$T",
            starter: false,
            copies: 1,
            category: "Networking"
        },
        {
            name: "Code Pipeline",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{$}*&#8545;",
            text: "<em>(Provides Credits equal to your pillar &#8545;)</em>",
            cost: "$$T",
            starter: false,
            copies: 1,
            category: "Development"
        },
        {
            name: "Elasticache",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{$}*&#8546;",
            text: "<em>(Provides Credits equal to your pillar &#8546;)</em>",
            cost: "$$T",
            starter: false,
            copies: 1,
            category: "Database"
        },
        {
            name: "Trusted Advisor",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{$}*&#8547;",
            text: "<em>(Provides Credits equal to your pillar &#8547;)</em>",
            cost: "$$T",
            starter: false,
            copies: 1,
            category: "Management"
        },
        {
            name: "EBS Snapshots",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{$}*&#8548;",
            text: "<em>(Provides Credits equal to your pillar &#8548;)</em>",
            cost: "$$T",
            starter: false,
            copies: 1,
            category: "Storage"
        },
        {
            name: "Security Consultant",
            type: "Resource",
            subtype: "Human",
            bigtext: "{T}*&#8544;",
            text: "<em>(Provides Talents equal to your pillar &#8544;)</em>",
            cost: "$$T",
            starter: false,
            copies: 1
        },
        {
            name: "Ops Manager",
            type: "Resource",
            subtype: "Human",
            bigtext: "{T}*&#8545;",
            text: "<em>(Provides Talents equal to your pillar &#8545;)</em>",
            cost: "$$T",
            starter: false,
            copies: 1
        },
        {
            name: "Assembly Expert",
            type: "Resource",
            subtype: "Human",
            bigtext: "{T}*&#8546;",
            text: "<em>(Provides Talents equal to your pillar &#8546;)</em>",
            cost: "$$T",
            starter: false,
            copies: 1
        },
        {
            name: "Finance Specialist",
            type: "Resource",
            subtype: "Human",
            bigtext: "{T}*&#8547;",
            text: "<em>(Provides Talents equal to your pillar &#8547;)</em>",
            cost: "$$T",
            starter: false,
            copies: 1
        },
        {
            name: "Reliability Engineer",
            type: "Resource",
            subtype: "Human",
            bigtext: "{T}*&#8548;",
            text: "<em>(Provides Talents equal to your pillar &#8548;)</em>",
            cost: "$$T",
            starter: false,
            copies: 1
        },
        {
            name: "KMS",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{Cr}*&#8544;",
            text: "<em>(Provides Creativity equal to your pillar &#8544;)</em>",
            cost: "$TT",
            starter: false,
            copies: 1,
            category: "Security"
        },
        {
            name: "Fargate",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{Cr}*&#8545;",
            text: "<em>(Provides Creativity equal to your pillar &#8545;)</em>",
            cost: "$TT",
            starter: false,
            copies: 1,
            category: "Compute"
        },
        {
            name: "Database Administrator",
            type: "Resource",
            subtype: "Human",
            bigtext: "{Cr}*&#8546;",
            text: "<em>(Provides Creativity equal to your pillar &#8546;)</em>",
            cost: "$TT",
            starter: false,
            copies: 1
        },
        {
            name: "Athena",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{Cr}*&#8547;",
            text: "<em>(Provides Creativity equal to your pillar &#8547;)</em>",
            cost: "$TT",
            starter: false,
            copies: 1,
            category: "Analytics"
        },
        {
            name: "Automation Engineer",
            type: "Resource",
            subtype: "Human",
            bigtext: "{Cr}*&#8548;",
            text: "<em>(Provides Creativity equal to your pillar &#8548;)</em>",
            cost: "$TT",
            starter: false,
            copies: 1
        },
        {
            name: "Predictive Autoscaling",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "Draw 1",
            text: "Look at the top card of any trial stack. You may put it on the bottom of that stack face up.",
            cost: "TT",
            starter: false,
            copies: 1,
            category: "Compute"
        },
        {
            name: "Competitive Research",
            type: "Resource",
            subtype: "Action",
            bigtext: "Draw 1",
            text: "Acquire a random card from an opponent's hand<br/><em>When you acquire a card, put it into your discard pile</em></br>",
            cost: "TTTT",
            starter: false,
            copies: 1
        },
        {
            name: "Security Bootcamp",
            type: "Resource",
            subtype: "Event",
            bigtext: "Promote<br/>&#8544;",
            text: "",
            cost: "$",
            starter: false,
            copies: 1
        },
        {
            name: "Ops Bootcamp",
            type: "Resource",
            subtype: "Event",
            bigtext: "Promote<br/>&#8545;",
            text: "",
            cost: "$",
            starter: false,
            copies: 1
        },
        {
            name: "Performance Bootcamp",
            type: "Resource",
            subtype: "Event",
            bigtext: "Promote<br/>&#8546;",
            text: "",
            cost: "$",
            starter: false,
            copies: 1
        },
        {
            name: "Cost Bootcamp",
            type: "Resource",
            subtype: "Event",
            bigtext: "Promote<br/>&#8547;",
            text: "",
            cost: "$",
            starter: false,
            copies: 1
        },
        {
            name: "Reliability Bootcamp",
            type: "Resource",
            subtype: "Event",
            bigtext: "Promote<br/>&#8548;",
            text: "",
            cost: "$",
            starter: false,
            copies: 1
        },
        {
            name: "Kinesis Stream",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "Discard 1",
            text: "<em>(Discard 1 from your hand)</em><br/>Then retire 1 from your hand",
            cost: "$",
            starter: false,
            copies: 1,
            category: "Analytics"
        },
        {
            name: "Quicksight",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{$} {Cr}",
            text: "<em>(Provides 1 Credit and 1 Creativity)</em>",
            cost: "TT",
            starter: false,
            copies: 1,
            category: "Analytics"
        },
        {
            name: "Aurora",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{$} {T}",
            text: "<em>(Provides 1 Credit and 1 Talent)</em>",
            cost: "$$",
            starter: false,
            copies: 1,
            category: "Database"
        },
        {
            name: "CloudFormation",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "Discard X",
            text: "Then draw X. Then you may retire 1 from your hand.",
            cost: "$TTT",
            starter: false,
            copies: 2,
            category: "Management"
        },
        {
            name: "re:Invent",
            type: "Resource",
            subtype: "Augment Human",
            bigtext: "{Cr}{Cr}",
            text: "<em>(Provides 1 Creativity)</em><br/>You must have a human resource to play this card",
            cost: "$T",
            starter: false,
            copies: 1
        },
        {
            name: "Poach",
            type: "Resource",
            subtype: "Action",
            bigtext: "Draw 1",
            text: "Force one player to demote a non-maxed pillar of your choice",
            auction: "Talent",
            cost: "$$TTT",
            starter: false,
            copies: 1
        },
        {
            name: "Crappy Coders",
            type: "Resource",
            subtype: "Bug",
            bigtext: "Demote",
            text: "<em>(Roll a d6 and demote that pillar. On a 6, you choose)</em><br/>Then retire this card.<br/><br/>When you acquire this, place it in an opponent's discard pile.",
            cost: "T",
            starter: false,
            copies: 2
        },
        {
            name: "Guard Duty",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{Cr}",
            text: "<em>(Provides 1 Creativity)</em><br/>Reveal this from your hand to prevent an action that affects one of your pillars",
            cost: "T",
            starter: false,
            copies: 1,
            category: "Security"
        },
        {
            name: "Chaos Testing",
            type: "Resource",
            subtype: "Action",
            bigtext: "{Cr} {Cr}",
            text: "<em>(Provides 2 Creativity)</em><br/>When you play this card, you must retire the top card of your deck",
            cost: "$T",
            starter: false,
            copies: 1
        },
        {
            name: "Think Tank",
            type: "Resource",
            subtype: "Event",
            bigtext: "Draw 3",
            text: "You may not acquire more cards this turn",
            cost: "$$TTT",
            auction: "Credits",
            starter: false,
            copies: 1
        },
        {
            name: "AWS Shield",
            type: "Resource",
            subtype: "Augment Cloud",
            bigtext: "{T}{T}",
            text: "<em>(Provides 2 Telents)</em><br/>You must have a cloud resource to play this card",
            cost: "$T",
            starter: false,
            copies: 1
        },
        {
            name: "Pro Cert",
            type: "Resource",
            subtype: "Augment Human",
            bigtext: "{$}{T}{Cr}",
            text: "<em>(Provides 1 Credit, 1 Talent, and 1 Creativity)</em><br/>You must have a human resource to play this card",
            cost: "$T",
            starter: false,
            copies: 1
        },
        {
            name: "Talented Jerk",
            type: "Resource",
            subtype: "Human",
            bigtext: "{Cr}{Cr}{$}",
            text: "<em>(Provides 2 Creativity and 1 Credit)</em><br/>If you fail a trial, demote in addition to any other penalties<br/><em>(Roll a d6 and demote that pillar. On a 6, you choose)</em>",
            cost: "$$TT",
            starter: false,
            copies: 1
        },
        {
            name: "Popular Product",
            type: "Resource",
            subtype: "Action",
            bigtext: "+3 Customers",
            text: "Promote Any Pillar",
            auction: "Talent",
            cost: "$$$TTT",
            starter: false,
            copies: 1
        },
        {
            name: "Promoted to VP",
            type: "Resource",
            subtype: "Augment Human",
            bigtext: "{Cr}{Cr}{Cr}",
            text: "<em>(Provides 3 Creativity)</em><br/>You must have a human resource to play this card<br/>You must discard a card from your hand to play this card",
            cost: "$$TT",
            starter: false,
            copies: 1
        },
        {
            name: "Cloud 9",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "Draw 1",
            text: "All opponents discard 1, then you retire 1 from your hand.",
            cost: "$TTT",
            starter: false,
            copies: 1,
            category: "Development"
        },
        {
            name: "Solutions Architect",
            type: "Resource",
            subtype: "Human",
            bigtext: "{T} {Cr} {Cr}",
            text: "<em>(Provides 1 Talent and 2 Creativity)</em>",
            cost: "$$TT",
            starter: false,
            copies: 2
        },
        {
            name: "Outsourcing",
            type: "Resource",
            subtype: "Human",
            bigtext: "{T}{T}{T}<br/>{Cr}{Cr}",
            text: "<em>(Provides 3 Talents and 2 Creativity)</em><br/>You must discard 2 cards from your hand to play this",
            auction: "Credits",
            cost: "$$$$$",
            starter: false,
            copies: 1
        },
        {
            name: "Lambda",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "+1 Customer",
            text: "Draw 2, then retire or discard 1 from your hand",
            auction: "Credits",
            cost: "$$TTT",
            starter: false,
            copies: 1,
            category: "Compute"
        },
        {
            name: "Senior Developer",
            type: "Resource",
            subtype: "Human",
            bigtext: "{T} {T}",
            text: "<em>(Provides 2 Talents)</em><br/>If you have a Compute Resource in play, draw an extra card at the end of your turn",
            cost: "$T",
            starter: false,
            copies: 3
        },
        {
            name: "SQS",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "Discard 1",
            text: "<em>(Discard 1 from your hand)</em><br/>Then draw 1",
            cost: "$",
            starter: false,
            copies: 2,
            category: "Integration"
        },
        {
            name: "EBS Volume",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "Draw 1",
            text: "Then discard 1 from your hand",
            cost: "$$",
            starter: false,
            copies: 1,
            category: "Storage"
        },
        {
            name: "Stack Overflow",
            type: "Resource",
            subtype: "Bug",
            bigtext: "-1 Customer",
            text: "Then retire this card.<br/><br/>When you acquire this, place it in an opponents's discard pile",
            cost: "T",
            starter: false,
            copies: 2
        },
        {
            name: "Off By 1",
            type: "Resource",
            subtype: "Bug",
            bigtext: "Discard 1",
            text: "<em>(Discard 1 from your hand)</em><br/>Then retire this card.<br/><br/>When you acquire this, place it in an opponents's discard pile",
            cost: "T",
            starter: false,
            copies: 2
        },
        {
            name: "VPC",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{Cr} {Cr}",
            text: "<em>(Provides 2 Creativity)</em>",
            cost: "TT",
            starter: false,
            copies: 2,
            category: "Networking"
        },
        {
            name: "S3 Bucket",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "Draw 1",
            text: "Then retire 1",
            cost: "TT",
            starter: false,
            copies: 1,
            category: "Storage"
        },
        {
            name: "First to Market",
            type: "Resource",
            subtype: "Action",
            bigtext: "Draw 1",
            text: "All other players discard down to 4 cards",
            auction: "Talent",
            cost: "$$TTT",
            starter: false,
            copies: 1
        },
        {
            name: "WAF",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{Cr}",
            text: "<em>(Provides 1 Creativity)</em><br/>Reveal this from your hand to prevent a discard from affecting you",
            cost: "$$",
            starter: false,
            copies: 1,
            category: "Security"
        },
        {
            name: "X-Ray",
            type: "Resource",
            subtype: "Augment Cloud",
            bigtext: "{Cr}",
            text: "<em>(Provides 1 Creativity)</em><br/>You must have a cloud resource to play this card",
            cost: "$T",
            starter: false,
            copies: 1,
            category: "Development"
        },
        {
            name: "Marketing Event",
            type: "Resource",
            subtype: "Event",
            bigtext: "+2 Customers",
            text: "",
            cost: "$$$",
            starter: false,
            copies: 2
        },
        {
            name: "Job Fair",
            type: "Resource",
            subtype: "Event",
            bigtext: "Retire 1",
            text: "All players except the player with the lowest experience demote a non-maxed pillar.<br/>The player with the lowest experience promotes any pillar.<br/>Retire this card.",
            cost: "$$",
            starter: false,
            copies: 1
        },
        {
            name: "Forecast",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "Draw 1",
            text: "Look at the top card of any trial stack. If you pass a trial this turn, gain an extra customer",
            cost: "$TT",
            starter: false,
            copies: 2,
            category: "AI-ML"
        },
        {
            name: "Sagemaker",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "{$} {T} {Cr}",
            text: "<em>(Provides 1 Credit, 1 Talent, and 1 Creativity.)</em><br/>Draw a card.<br/> You must face a Phase 3 trial this turn.",
            cost: "$$$$$",
            auction: "Credits",
            starter: false,
            copies: 1,
            category: "AI-ML"
        },
        {
            name: "Database Migration",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "Draw 3",
            text: "Then discard 1 from your hand at random, then retire 1 from your hand at random",
            cost: "TTT",
            starter: false,
            copies: 1,
            category: "Database"
        },
        {
            name: "Recruiter",
            type: "Resource",
            subtype: "Human",
            bigtext: "{T} {T} {T}",
            text: "<em>(Provides 3 Talents)</em>",
            cost: "$$$$",
            starter: false,
            copies: 1
        },
        {
            name: "Collaboration",
            type: "Resource",
            subtype: "Action",
            bigtext: "Draw 1",
            text: "Take 2 customers from the player with the most customers. Keep 1 and give the other to the player with the least customers",
            cost: "$$TT",
            starter: false,
            copies: 1
        },
        {
            name: "Patent Awarded",
            type: "Resource",
            subtype: "Event",
            bigtext: "+2 Customers",
            text: "Take a card from an opponent's discard pile and put it in your discard pile",
            cost: "$$TTT",
            auction: "Credits",
            starter: false,
            copies: 1
        },
        {
            name: "Reference Card",
            type: "Reference",
            subtype: "Bonuses",
            bigtext: "Bonus Customers",
            text: "Each maxed pillar: +3<br/>Pair of Categories: +2<br/>5 different Categories: +3<br/>All 10 Categories: +10<br/><em>Each card counts toward only one bonus</em>",
            starter: false,
            copies: 4
        }
    ]
}

        /*
                ,
                {
                    name: "",
                    type: "",
                    subtype: "",
                    bigtext: "",
                    text: "",
                    cost: "",
                    starter: false,
                    copies: 1
                }
        */