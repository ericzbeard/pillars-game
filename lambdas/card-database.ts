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
export const cardDatabase = {
    version: "0.5",
    set: "alpha",
    cards: [
        {
            name: "EC2 Instance",
            marketing: "Virtual servers in the cloud.",
            type: "Resource",
            subtype: "Cloud",
            starter: true,
            copies: 12,
            category: "Compute", 
            provides: { 
                "Credit": 1
            }, 
            info: "Amazon Elastic Compute Cloud (Amazon EC2) is a web service that provides secure, resizable compute capacity in the cloud. It is designed to make web-scale cloud computing easier for developers. Amazon EC2’s simple web service interface allows you to obtain and configure capacity with minimal friction. It provides you with complete control of your computing resources and lets you run on Amazon’s proven computing environment.", 
            href: "https://aws.amazon.com/ec2/"
        },
        {
            name: "Junior Developer",
            type: "Resource",
            subtype: "Human",
            starter: true,
            copies: 12, 
            provides: { 
                "Talent": 1
            }
        },
        {
            name: "AWS Support",
            marketing: "Maintain operational health of your AWS solutions.",
            type: "Resource",
            subtype: "Human",
            starter: true,
            copies: 8,
            flavor: "You do have a support contract, don't you?", 
            provides: { 
                "Creativity": 1
            }, 
            info: "At AWS, Support goes beyond break-fix and issue resolution. AWS Support provides a mix of tools and technology, people, and programs designed to proactively help you optimize performance, lower costs, and innovate faster. We save time for your team by helping you to move faster in the cloud and focus on your core business.",
            href: "https://aws.amazon.com/premiumsupport/"
        },
        {
            name: "Sandbox Credit",
            type: "Resource",
            subtype: "Augment Cloud",
            starter: true,
            copies: 4, 
            provides: { 
                "Credit": 1
            }, 
            augments: "Cloud"
        },
        {
            name: "Training",
            type: "Resource",
            subtype: "Augment Human",
            starter: true,
            copies: 4, 
            provides: { 
                "Talent": 1
            }, 
            augments: "Human", 
            info: "Organizations need individuals with cloud skills to help transform their business. AWS Training and Certification helps you build and validate your cloud skills so you can get more out of the cloud. Our content is built by experts at AWS and updated regularly to keep pace with AWS updates, so you can be sure you’re learning the latest and keeping your cloud skills fresh.", 
            href: "https://aws.amazon.com/training/"
        },
        {
            name: "Decommision",
            type: "Resource",
            subtype: "Action",
            bigtext: "Retire 1",
            text: "Or Retire this card and add one Credit",
            starter: true,
            copies: 4
        },
        {
            name: "Decommision-1",
            type: "Resource",
            subtype: "Action",
            bigtext: "Retire 1",
            starter: true,
            copies: 0
        },
        {
            name: "Decommision-2",
            type: "Resource",
            subtype: "Action",
            text: "Retire this card and add one credit",
            starter: true,
            copies: 0
        },
        {
            name: "Get Certified",
            type: "Resource",
            subtype: "Action",
            starter: true,
            copies: 4, 
            action: {
                "Promote": 6
            }, 
            info: "AWS Certification validates cloud expertise to help professionals highlight in-demand skills and organizations build effective, innovative teams for cloud initiatives using AWS. Choose from diverse certification exams by role and specialty designed to empower individuals and teams to meet their unique goals.", 
            href: "https://aws.amazon.com/certification/"
        },
        {
            name: "DDoS Attack",
            type: "Trial",
            subtype: "Phase 1",
            trial: 7,
            text: "",
            success: [
                "+2 Customers",
                "You may retire a card you played this turn."
            ],
            fail: [
                "-1 Customer"
            ],
            starter: false,
            copies: 1,
            flavor: "Our site is getting a ton of unique visitors today! Wait a minute... Uh Oh..."
        },
        {
            name: "Unrealistic Deadline",
            type: "Trial",
            subtype: "Phase 1",
            trial: 6,
            text: "",
            success: [
                "+1 Customer",
                "Promote"
            ],
            fail: ["Demote"],
            starter: false,
            copies: 1
        },
        {
            name: "No Sales Pipeline",
            type: "Trial",
            subtype: "Phase 1",
            trial: 7,
            text: "",
            success: ["+2 Customers","Promote"],
            fail: ["-1 Customer"],
            starter: false,
            copies: 1
        },
        {
            name: "Talent Shortage",
            type: "Trial",
            subtype: "Phase 1",
            trial: 6,
            text: "",
            success: ["+1 Customer"],
            fail: ["Draw 1 less card at the end of this turn"],
            starter: false,
            copies: 1
        },
        {
            name: "Hack Attempt",
            type: "Trial",
            subtype: "Phase 1",
            trial: 7,
            text: "",
            success: ["+1 Customer","Promote I"],
            fail: ["-1 Customer"],
            starter: false,
            copies: 1, 
            pillarIndex: 0, 
            pillarNumeral: 'I'
        },
        {
            name: "Bug Reports",
            type: "Trial",
            subtype: "Phase 1",
            trial: 7,
            text: "",
            success: ["+1 Customer","Promote III"],
            fail: ["-1 Customer"],
            starter: false,
            copies: 1, 
            pillarIndex: 2, 
            pillarNumeral: 'III'
        },
        {
            name: "Slow Website",
            type: "Trial",
            subtype: "Phase 1",
            trial: 7,
            text: "",
            success: ["+1 Customer","Promote IV"],
            fail: ["-1 Customer"],
            starter: false,
            copies: 1, 
            pillarIndex: 3, 
            pillarNumeral: 'IV'
        },
        {
            name: "License Fee Increase",
            type: "Trial",
            subtype: "Phase 1",
            trial: 7,
            text: "",
            success: ["+1 Customer","Promote V"],
            fail: ["-1 Customer"],
            starter: false,
            copies: 1, 
            pillarIndex: 4, 
            pillarNumeral: 'V'
        },
        {
            name: "Competitive Threat",
            type: "Trial",
            subtype: "Phase 1",
            trial: 5,
            text: "",
            success: ["+2 Customers"],
            fail: ["-1 Customer"],
            starter: false,
            copies: 1
        },
        {
            name: "Monolithic Architecture",
            type: "Trial",
            subtype: "Phase 1",
            trial: 8,
            text: "",
            success: ["+2 Customers","Promote Any"],
            fail: ["Demote"],
            starter: false,
            copies: 1
        },
        {
            name: "Application Rewrite",
            type: "Trial",
            subtype: "Phase 2",
            trial: 8,
            text: "",
            success: ["+3 Customers"],
            fail: ["-2 Customers"],
            starter: false,
            copies: 1
        },
        {
            name: "Outdated Technology",
            type: "Trial",
            subtype: "Phase 2",
            trial: 8,
            text: "",
            success: ["+2 Customers","Promote"],
            fail: ["Demote"],
            starter: false,
            copies: 1
        },
        {
            name: "Throttled Bandwidth",
            type: "Trial",
            subtype: "Phase 2",
            trial: 9,
            text: "If you have any cards in play that provide Creativity, place one of them in the discard pile before rolling",
            success: ["+2 Customers","Promote"],
            fail: ["-1 Customer"],
            starter: false,
            copies: 1
        },
        {
            name: "Fire at HQ",
            type: "Trial",
            subtype: "Phase 2",
            trial: 11,
            text: "Add Creativity * I to your roll",
            success: ["+3 Customers","Promote I"],
            fail: ["-1 Customer"],
            starter: false,
            copies: 1,
            flavor: "I told you that was my red stapler.", 
            pillarIndex: 0, 
            pillarNumeral: 'I'
        },
        {
            name: "Security Incident",
            type: "Trial",
            subtype: "Phase 2",
            trial: 11,
            text: "Add Creativity * II to your roll",
            success: ["+3 Customers","Promote II"],
            fail: ["-1 Customer"],
            starter: false,
            copies: 1, 
            pillarIndex: 1, 
            pillarNumeral: 'II'
        },
        {
            name: "Latency",
            type: "Trial",
            subtype: "Phase 2",
            trial: 11,
            text: "Add Creativity * IV to your roll",
            success: ["+3 Customers","Promote IV"],
            fail: ["-1 Customer"],
            starter: false,
            copies: 1, 
            pillarIndex: 3, 
            pillarNumeral: 'IV'
        },
        {
            name: "Cash Flow Issues",
            type: "Trial",
            subtype: "Phase 2",
            trial: 11,
            text: "Add Creativity * V to your roll",
            success: ["+3 Customers","Promote V"],
            fail: ["-1 Customer"],
            starter: false,
            copies: 1, 
            pillarIndex: 4, 
            pillarNumeral: 'V'
        },
        {
            name: "Server Crash",
            type: "Trial",
            subtype: "Phase 2",
            trial: 11,
            text: "Add Creativity * III to your roll",
            success: ["+3 Customers","Promote III"],
            fail: ["-1 Customer"],
            starter: false,
            copies: 1, 
            pillarIndex: 2, 
            pillarNumeral: 'III'
        },
        {
            name: "Data Center Migration",
            type: "Trial",
            subtype: "Phase 2",
            trial: 10,
            text: "",
            success: ["+1 Customer","Promote your lowest pillars"],
            fail: ["-1 Customer","Demote"],
            starter: false,
            copies: 1
        },
        {
            name: "Employees Poached",
            type: "Trial",
            subtype: "Phase 2",
            trial: 11,
            text: "",
            success: ["Acquire a resource card from the market for free"],
            fail: ["Demote twice"],
            starter: false,
            copies: 1
        },
        {
            name: "Single Point of Failure",
            type: "Trial",
            subtype: "Phase 3",
            trial: 13,
            text: "You must retire a resource in play that provides Creativity or subtract 2 from your roll",
            success: ["+3 Customers","Promote V"],
            fail: ["-2 Customers"],
            starter: false,
            copies: 1, 
            pillarIndex: 4, 
            pillarNumeral: 'V'
        },
        {
            name: "Bad Press",
            type: "Trial",
            subtype: "Phase 3",
            trial: 11,
            text: "",
            success: ["+4 Customers"],
            fail: ["-2 Customers"],
            starter: false,
            copies: 1
        },
        {
            name: "Failed Rollback",
            type: "Trial",
            subtype: "Phase 3",
            trial: 11,
            text: "Subtract 1 from your roll if your pillar I is not maxed",
            success: ["+4 Customers","Promote Any"],
            fail: ["-1 Cusotomer","Demote"],
            starter: false,
            copies: 1, 
            pillarIndex: 0, 
            pillarNumeral: 'I'
        },
        {
            name: "Rogue Employee",
            type: "Trial",
            subtype: "Phase 3",
            trial: 12,
            text: "Subtract 1 from your roll if your pillar II is not maxed",
            success: ["+4 Customers","Promote Any"],
            fail: ["-2 Cusotomers","Demote"],
            starter: false,
            copies: 1, 
            pillarIndex: 1, 
            pillarNumeral: 'II'
        },
        {
            name: "Deadlocks",
            type: "Trial",
            subtype: "Phase 3",
            trial: 12,
            text: "Subtract 1 from your roll if your pillar IV is not maxed",
            success: ["+4 Customers","Promote Any"],
            fail: ["-1 Cusotomer","Demote"],
            starter: false,
            copies: 1, 
            pillarIndex: 3, 
            pillarNumeral: 'IV'
        },
        {
            name: "Service Limits",
            type: "Trial",
            subtype: "Phase 3",
            trial: 12,
            text: "Subtract 1 from your roll if your pillar V is not maxed",
            success: ["+4 Customers","Promote Any"],
            fail: ["-1 Cusotomer","Demote"],
            starter: false,
            copies: 1, 
            pillarIndex: 4, 
            pillarNumeral: 'V'
        },
        {
            name: "Segmentation Fault",
            type: "Trial",
            subtype: "Phase 3",
            trial: 12,
            text: "Subtract 1 from your roll if your pillar III is not maxed",
            success: ["+4 Customers","Promote Any"],
            fail: ["-1 Cusotomer","Demote"],
            starter: false,
            copies: 1, 
            pillarIndex: 2, 
            pillarNumeral: 'III'
        },
        {
            name: "Unpatched OS",
            type: "Trial",
            subtype: "Phase 3",
            trial: 13,
            text: "+2 to your roll if you spent at least one Credit and at least one Talent this turn",
            success: ["+2 Customers","Promote twice"],
            fail: ["Demote your highest non-maxed Pillar"],
            starter: false,
            copies: 1
        },
        {
            name: "Technology Disruption",
            type: "Trial",
            subtype: "Phase 3",
            trial: 14,
            text: "+2 Creativity for each of your maxed pillars",
            success: ["+1 Customer","Acquire a card from an opponent's discard pile"],
            fail: ["Opponents may put a card from their hand into your discard pile"],
            starter: false,
            copies: 1
        },
        {
            name: "Legal Battle",
            type: "Trial",
            subtype: "Phase 3",
            trial: 15,
            text: "Add Creativity to your roll equal to your lowest pillar",
            success: ["+1 Customer","Max one non-maxed pillar"],
            fail: ["The opponent to your right demotes any one of your non-maxed pillars"],
            starter: false,
            copies: 1
        },
        {
            name: "Operational Excellence",
            type: "Pillar",
            subtype: "",
            text: "",
            cost: "",
            pillar: true,
            starter: false,
            copies: 1, 
            pillarIndex: 0, 
            pillarNumeral: 'I'
        },
        {
            name: "Security",
            type: "Pillar",
            subtype: "",
            text: "",
            cost: "",
            pillar: true,
            starter: false,
            copies: 1, 
            pillarIndex: 1, 
            pillarNumeral: 'II'
        },
        {
            name: "Reliability",
            type: "Pillar",
            subtype: "",
            text: "",
            cost: "",
            pillar: true,
            starter: false,
            copies: 1, 
            pillarIndex: 2, 
            pillarNumeral: 'III'
        },
        {
            name: "Performance Efficiency",
            type: "Pillar",
            subtype: "",
            text: "",
            cost: "",
            pillar: true,
            starter: false,
            copies: 1, 
            pillarIndex: 3, 
            pillarNumeral: 'IV'
        },
        {
            name: "Cost Optimization",
            type: "Pillar",
            subtype: "",
            text: "",
            cost: "",
            pillar: true,
            starter: false,
            copies: 1, 
            pillarIndex: 4, 
            pillarNumeral: 'V'
        },
        {
            name: "Planning Session",
            type: "Resource",
            subtype: "Event",
            text: "",
            cost: "TTT",
            starter: false,
            copies: 2, 
            action: {
                "Draw": 2
            }
        },
        {
            name: "Account Manager",
            type: "Resource",
            subtype: "Human",
            cost: "$T",
            starter: false,
            copies: 3, 
            provides: {
                "Credit": 2
            }
        },
        {
            name: "Ops Workshop",
            type: "Resource",
            subtype: "Event",
            text: "Draw 1 more if you have 4+ on pillar I",
            cost: "$T",
            starter: false,
            copies: 1, 
            pillarIndex: 0, 
            pillarNumeral: 'I', 
            action: {
                "Draw": 1
            }, 
            conditionalAction: {
                "Draw": 1,
                "Pillar": {
                    "Index": 0, 
                    "Rank": 4
                }
            }
        },
        {
            name: "Security Workshop",
            type: "Resource",
            subtype: "Event",
            text: "Draw 1 more if you have 4+ on pillar II",
            cost: "$T",
            starter: false,
            copies: 1, 
            pillarIndex: 1, 
            pillarNumeral: 'II', 
            action: {
                "Draw": 1
            }, 
            conditionalAction: {
                "Draw": 1,
                "Pillar": {
                    "Index": 1, 
                    "Rank": 4
                }
            }
        },
        {
            name: "Reliability Workshop",
            type: "Resource",
            subtype: "Event",
            text: "Draw 1 more if you have 4+ on pillar III",
            cost: "$T",
            starter: false,
            copies: 1, 
            pillarIndex: 2, 
            pillarNumeral: 'III', 
            action: {
                "Draw": 1
            }, 
            conditionalAction: {
                "Draw": 1,
                "Pillar": {
                    "Index": 2, 
                    "Rank": 4
                }
            }
        },
        {
            name: "Performance Workshop",
            type: "Resource",
            subtype: "Event",
            text: "Draw 1 more if you have 4+ on pillar IV",
            cost: "$T",
            starter: false,
            copies: 1, 
            pillarIndex: 3, 
            pillarNumeral: 'IV', 
            action: {
                "Draw": 1
            }, 
            conditionalAction: {
                "Draw": 1,
                "Pillar": {
                    "Index": 3, 
                    "Rank": 4
                }
            }
        },
        {
            name: "Budget Workshop",
            type: "Resource",
            subtype: "Event",
            text: "Draw 1 more if you have 4+ on pillar V",
            cost: "$T",
            starter: false,
            copies: 1, 
            pillarIndex: 4, 
            pillarNumeral: 'V', 
            action: {
                "Draw": 1
            }, 
            conditionalAction: {
                "Draw": 1,
                "Pillar": {
                    "Index": 4, 
                    "Rank": 4
                }
            }
        },
        {
            name: "Code Pipeline",
            type: "Resource",
            subtype: "Cloud",
            cost: "$$T",
            starter: false,
            copies: 1,
            category: "Development", 
            pillarIndex: 0, 
            pillarNumeral: 'I', 
            provides: {
                "CreditByPillar": 0
            }
        },
        {
            name: "Access Control List",
            type: "Resource",
            subtype: "Cloud",
            cost: "$$T",
            starter: false,
            copies: 1,
            category: "Networking", 
            pillarIndex: 1, 
            pillarNumeral: 'II', 
            provides: {
                "CreditByPillar": 1
            }
        },
        {
            name: "EBS Snapshots",
            type: "Resource",
            subtype: "Cloud",
            cost: "$$T",
            starter: false,
            copies: 1,
            category: "Storage", 
            pillarIndex: 2, 
            pillarNumeral: 'III', 
            provides: {
                "CreditByPillar": 2
            }
        },
        {
            name: "Elasticache",
            type: "Resource",
            subtype: "Cloud",
            cost: "$$T",
            starter: false,
            copies: 1,
            category: "Database", 
            pillarIndex: 3, 
            pillarNumeral: 'IV', 
            provides: {
                "CreditByPillar": 3
            }
        },
        {
            name: "Trusted Advisor",
            type: "Resource",
            subtype: "Cloud",
            cost: "$$T",
            starter: false,
            copies: 1,
            category: "Management", 
            pillarIndex: 4, 
            pillarNumeral: 'V', 
            provides: {
                "CreditByPillar": 4
            }
        },
        {
            name: "Ops Manager",
            type: "Resource",
            subtype: "Human",
            cost: "$$T",
            starter: false,
            copies: 1, 
            pillarIndex: 0, 
            pillarNumeral: 'I', 
            provides: {
                "TalentByPillar": 0
            }
        },
        {
            name: "Security Consultant",
            type: "Resource",
            subtype: "Human",
            cost: "$$T",
            starter: false,
            copies: 1, 
            pillarIndex: 1, 
            pillarNumeral: 'II', 
            provides: {
                "TalentByPillar": 1
            }
        },
        {
            name: "Reliability Engineer",
            type: "Resource",
            subtype: "Human",
            cost: "$$T",
            starter: false,
            copies: 1, 
            pillarIndex: 2, 
            pillarNumeral: 'III', 
            provides: {
                "TalentByPillar": 2
            }
        },
        {
            name: "Assembly Expert",
            type: "Resource",
            subtype: "Human",
            cost: "$$T",
            starter: false,
            copies: 1, 
            pillarIndex: 3, 
            pillarNumeral: 'IV', 
            provides: {
                "TalentByPillar": 3
            }
        },
        {
            name: "Finance Specialist",
            type: "Resource",
            subtype: "Human",
            cost: "$$T",
            starter: false,
            copies: 1, 
            pillarIndex: 4, 
            pillarNumeral: 'V', 
            provides: {
                "TalentByPillar": 4
            }
        },
        {
            name: "Fargate",
            type: "Resource",
            subtype: "Cloud",
            cost: "$TT",
            starter: false,
            copies: 1,
            category: "Compute", 
            pillarIndex: 0, 
            pillarNumeral: 'I', 
            provides: {
                "CreativityByPillar": 0
            }
        },
        {
            name: "KMS",
            type: "Resource",
            subtype: "Cloud",
            cost: "$TT",
            starter: false,
            copies: 1,
            category: "Security", 
            pillarIndex: 1, 
            pillarNumeral: 'II', 
            provides: {
                "CreativityByPillar": 1
            }
        },
        {
            name: "Automation Engineer",
            type: "Resource",
            subtype: "Human",
            cost: "$TT",
            starter: false,
            copies: 1, 
            pillarIndex: 2, 
            pillarNumeral: 'III', 
            provides: {
                "CreativityByPillar": 1
            }
        },
        {
            name: "Database Administrator",
            type: "Resource",
            subtype: "Human",
            cost: "$TT",
            starter: false,
            copies: 1, 
            pillarIndex: 3, 
            pillarNumeral: 'IV', 
            provides: {
                "CreativityByPillar": 3
            }
        },
        {
            name: "Athena",
            type: "Resource",
            subtype: "Cloud",
            cost: "$TT",
            starter: false,
            copies: 1,
            category: "Analytics", 
            pillarIndex: 4, 
            pillarNumeral: 'V', 
            provides: {
                "CreativityByPillar": 4
            }
        },
        {
            name: "Predictive Autoscaling",
            type: "Resource",
            subtype: "Cloud",
            text: "Look at the top card of any trial stack. You may put it on the bottom of that stack face up.",
            cost: "TT",
            starter: false,
            copies: 1,
            category: "Compute",
            action: {
                "Draw": 1
            }
        },
        {
            name: "Competitive Research",
            type: "Resource",
            subtype: "Action",
            text: "Acquire a random card from an opponent's hand",
            cost: "TTTT",
            starter: false,
            copies: 1,
            action: {
                "Draw": 1
            }
        },
        {
            name: "Ops Bootcamp",
            type: "Resource",
            subtype: "Event",
            text: "",
            cost: "$",
            starter: false,
            copies: 1, 
            pillarIndex: 0, 
            pillarNumeral: 'I', 
            action: {
                "Promote": 0
            }
        },
        {
            name: "Security Bootcamp",
            type: "Resource",
            subtype: "Event",
            text: "",
            cost: "$",
            starter: false,
            copies: 1, 
            pillarIndex: 1, 
            pillarNumeral: 'II', 
            action: {
                "Promote": 1
            }
        },
        {
            name: "Reliability Bootcamp",
            type: "Resource",
            subtype: "Event",
            text: "",
            cost: "$",
            starter: false,
            copies: 1, 
            pillarIndex: 2, 
            pillarNumeral: 'III', 
            action: {
                "Promote": 2
            }
        },
        {
            name: "Performance Bootcamp",
            type: "Resource",
            subtype: "Event",
            text: "",
            cost: "$",
            starter: false,
            copies: 1, 
            pillarIndex: 3, 
            pillarNumeral: 'IV', 
            action: {
                "Promote": 3
            }
        },
        {
            name: "Cost Bootcamp",
            type: "Resource",
            subtype: "Event",
            text: "",
            cost: "$",
            starter: false,
            copies: 1, 
            pillarIndex: 4, 
            pillarNumeral: 'V', 
            action: {
                "Promote": 4
            }
        },
        {
            name: "Amazon Kinesis",
            marketing: "Collect, process, and analyze video and data streams in real time",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "Discard 1",
            text: "Then retire 1 from your hand",
            cost: "$",
            starter: false,
            copies: 1,
            category: "Analytics",
            info: "Amazon Kinesis makes it easy to collect, process, and analyze real-time, streaming data so you can get timely insights and react quickly to new information. Amazon Kinesis offers key capabilities to cost-effectively process streaming data at any scale, along with the flexibility to choose the tools that best suit the requirements of your application.",
            href: "https://aws.amazon.com/kinesis/"
        },
        {
            name: "Quicksight",
            type: "Resource",
            subtype: "Cloud",
            cost: "TT",
            starter: false,
            copies: 1,
            category: "Analytics", 
            provides: {
                "Credit": 1,
                "Creativity": 1
            }
        },
        {
            name: "Aurora",
            type: "Resource",
            subtype: "Cloud",
            cost: "$$",
            starter: false,
            copies: 1,
            category: "Database", 
            provides: {
                "Credit": 1,
                "Talent": 1
            }
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
            cost: "$T",
            starter: false,
            copies: 1, 
            provides: {
                "Creativity": 2
            }
        },
        {
            name: "Poach",
            type: "Resource",
            subtype: "Action",
            text: "Force one player to demote a non-maxed pillar of your choice",
            auction: "Talent",
            cost: "$$TTT",
            starter: false,
            copies: 1, 
            action: {
                "Draw": 1
            }
        },
        {
            name: "Crappy Coders",
            type: "Resource",
            subtype: "Bug",
            cost: "T",
            starter: false,
            copies: 2, 
            action: { 
                "Demote": 6
            }
        },
        {
            name: "Guard Duty",
            type: "Resource",
            subtype: "Cloud",
            text: "Reveal this from your hand to prevent an action that affects one of your pillars",
            cost: "T",
            starter: false,
            copies: 1,
            category: "Security", 
            provides: {
                "Creativity": 1
            }
        },
        {
            name: "Chaos Testing",
            type: "Resource",
            subtype: "Action",
            text: "When you play this card, you must retire the top card of your deck",
            cost: "$T",
            starter: false,
            copies: 1, 
            provides: {
                "Creativity": 1
            }
        },
        {
            name: "Think Tank",
            type: "Resource",
            subtype: "Event",
            text: "You may not acquire more cards this turn",
            cost: "$$TTT",
            auction: "Credits",
            starter: false,
            copies: 1, 
            action: {
                "Draw": 3
            }
        },
        {
            name: "AWS Shield",
            type: "Resource",
            subtype: "Augment Cloud",
            cost: "$T",
            starter: false,
            copies: 1, 
            provides: {
                "Talent": 2
            }
        },
        {
            name: "AWS Professional Certification",
            type: "Resource",
            subtype: "Augment Human",
            cost: "$T",
            starter: false,
            copies: 1, 
            provides: {
                "Talent": 1, 
                "Credit": 1, 
                "Creativity": 1
            }
        },
        {
            name: "Talented Jerk",
            type: "Resource",
            subtype: "Human",
            text: "If you fail a trial, demote in addition to any other penalties",
            cost: "$$TT",
            starter: false,
            copies: 1, 
            provides: {
                "Credit": 1, 
                "Creativity": 2
            }
        },
        {
            name: "Popular Product",
            type: "Resource",
            subtype: "Action",
            text: "Promote Any Pillar",
            auction: "Talent",
            cost: "$$$TTT",
            starter: false,
            copies: 1, 
            provides: {
                "Customer": 3
            }, 
            action: {
                "Promote": 5
            }
        },
        {
            name: "Promoted to VP",
            type: "Resource",
            subtype: "Augment Human",
            text: "You must discard a card from your hand to play this card",
            cost: "$$TT",
            starter: false,
            copies: 1, 
            provides: {
                "Creativity": 3
            }
        },
        {
            name: "Cloud 9",
            type: "Resource",
            subtype: "Cloud",
            text: "All opponents discard 1, then you retire 1 from your hand.",
            cost: "$TTT",
            starter: false,
            copies: 1,
            category: "Development", 
            action: {
                "Draw": 1
            }
        },
        {
            name: "Solutions Architect",
            type: "Resource",
            subtype: "Human",
            cost: "$$TT",
            starter: false,
            copies: 2, 
            provides: {
                "Creativity": 2, 
                "Talent": 1
            }
        },
        {
            name: "Outsourcing",
            type: "Resource",
            subtype: "Human",
            text: "You must discard 2 cards from your hand to play this",
            auction: "Credits",
            cost: "$$$$$",
            starter: false,
            copies: 1, 
            provides: {
                "Creativity": 2, 
                "Talent": 3
            }
        },
        {
            name: "AWS Lambda",
            type: "Resource",
            subtype: "Cloud",
            text: "Draw 2, then retire or discard 1 from your hand",
            auction: "Credits",
            cost: "$$TTT",
            starter: false,
            copies: 1,
            category: "Compute", 
            provides: {
                "Customer": 1
            }
        },
        {
            name: "Senior Developer",
            type: "Resource",
            subtype: "Human",
            text: "If you have a Compute Resource in play, draw an extra card at the end of your turn",
            cost: "$T",
            starter: false,
            copies: 3, 
            provides: {
                "Talent": 2
            }
        },
        {
            name: "SQS",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "Discard 1",
            text: "Then draw 1",
            cost: "$",
            starter: false,
            copies: 2,
            category: "Integration"
        },
        {
            name: "EBS Volume",
            type: "Resource",
            subtype: "Cloud",
            text: "Then discard 1 from your hand",
            cost: "$$",
            starter: false,
            copies: 1,
            category: "Storage", 
            action: {
                "Draw": 2
            }
        },
        {
            name: "Stack Overflow",
            type: "Resource",
            subtype: "Bug",
            cost: "T",
            starter: false,
            copies: 2, 
            provides: {
                "Customer": -1
            }
        },
        {
            name: "Off By 1",
            type: "Resource",
            subtype: "Bug",
            bigtext: "Discard 1",
            cost: "T",
            starter: false,
            copies: 2
        },
        {
            name: "VPC",
            type: "Resource",
            subtype: "Cloud",
            cost: "TT",
            starter: false,
            copies: 2,
            category: "Networking", 
            provides: {
                "Creativity": 2
            }
        },
        {
            name: "S3 Bucket",
            type: "Resource",
            subtype: "Cloud",
            text: "Then retire 1",
            cost: "TT",
            starter: false,
            copies: 1,
            category: "Storage", 
            action: {
                "Draw": 1
            }
        },
        {
            name: "First to Market",
            type: "Resource",
            subtype: "Action",
            text: "All other players discard down to 4 cards",
            auction: "Talent",
            cost: "$$TTT",
            starter: false,
            copies: 1, 
            action: {
                "Draw": 1
            }
        },
        {
            name: "WAF",
            type: "Resource",
            subtype: "Cloud",
            text: "Reveal this from your hand to prevent a discard from affecting you",
            cost: "$$",
            starter: false,
            copies: 1,
            category: "Security", 
            provides: {
                "Creativity": 1
            }
        },
        {
            name: "X-Ray",
            type: "Resource",
            subtype: "Augment Cloud",
            cost: "$T",
            starter: false,
            copies: 1,
            category: "Development", 
            provides: {
                "Creativity": 1
            }
        },
        {
            name: "Marketing Event",
            type: "Resource",
            subtype: "Event",
            text: "",
            cost: "$$$",
            starter: false,
            copies: 2, 
            provides: {
                "Customer": 2
            }
        },
        {
            name: "Job Fair",
            type: "Resource",
            subtype: "Event",
            bigtext: "Retire 1",
            text: "All players except the player with the lowest XP demote a non-maxed pillar. The player with the lowest XP promotes any pillar. Retire this card.",
            cost: "$$",
            starter: false,
            copies: 1
        },
        {
            name: "Forecast",
            type: "Resource",
            subtype: "Cloud",
            text: "Look at the top card of any trial stack. If you pass a trial this turn, gain an extra customer",
            cost: "$TT",
            starter: false,
            copies: 2,
            category: "AI-ML", 
            action: {
                "Draw": 1
            }
        },
        {
            name: "Sagemaker",
            type: "Resource",
            subtype: "Cloud",
            text: "Draw a card. You must face a Phase 3 trial this turn.",
            cost: "$$$$$",
            auction: "Credits",
            starter: false,
            copies: 1,
            category: "AI-ML", 
            provides: {
                "Credit": 1, 
                "Talent": 1, 
                "Creativity": 1
            }
        },
        {
            name: "Database Migration",
            type: "Resource",
            subtype: "Cloud",
            text: "Then discard 1 from your hand at random, then retire 1 from your hand at random",
            cost: "TTT",
            starter: false,
            copies: 1,
            category: "Database", 
            action: {
                "Draw": 3
            }
        },
        {
            name: "Recruiter",
            type: "Resource",
            subtype: "Human",
            cost: "$$$$",
            starter: false,
            copies: 1, 
            provides: {
                "Talent": 3
            }
        },
        {
            name: "Collaboration",
            type: "Resource",
            subtype: "Action",
            text: "Take 2 customers from the player with the most customers. Keep 1 and give the other to the player with the least customers",
            cost: "$$TT",
            starter: false,
            copies: 1, 
            action: {
                "Draw": 1
            }
        },
        {
            name: "Patent Awarded",
            type: "Resource",
            subtype: "Event",
            text: "Take a card from an opponent's discard pile and put it in your discard pile",
            cost: "$$TTT",
            auction: "Credits",
            starter: false,
            copies: 1, 
            provides: {
                "Customer": 2
            }
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