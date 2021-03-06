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
            success: {
                customers: 2, 
                custom: "You may retire a card you played this turn."
            },
            fail: {
                customers: -1
            },
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
            success: {
                customers: 1,
                promote: 6
            },
            fail: { demote: 5 },
            starter: false,
            copies: 1
        },
        {
            name: "No Sales Pipeline",
            type: "Trial",
            subtype: "Phase 1",
            trial: 7,
            text: "",
            success: { 
                customers: 2, 
                promote: 6
            },
            fail: { customers: -1},
            starter: false,
            copies: 1
        },
        {
            name: "Talent Shortage",
            type: "Trial",
            subtype: "Phase 1",
            trial: 6,
            text: "",
            success: { customers: 1 },
            fail: { custom: "Draw 1 less card at the end of this turn" },
            starter: false,
            copies: 1
        },
        {
            name: "Hack Attempt",
            type: "Trial",
            subtype: "Phase 1",
            trial: 7,
            text: "",
            success: { customers: 1, promote: 1 },
            fail: { customer: -1 },
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
            success: { customers: 1, promote: 2},
            fail: { customers: -1 },
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
            success: { customers: 1, promote: 3 },
            fail: { customers: -1 },
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
            success: { customers: 1, promote: 4 },
            fail: { customers: -1 },
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
            success: { customers: 2},
            fail: { customers: -1 },
            starter: false,
            copies: 1
        },
        {
            name: "Monolithic Architecture",
            type: "Trial",
            subtype: "Phase 1",
            trial: 8,
            text: "",
            success: { customers: 2, promote: 5 },
            fail: { demote: 6 },
            starter: false,
            copies: 1
        },
        {
            name: "Application Rewrite",
            type: "Trial",
            subtype: "Phase 2",
            trial: 8,
            text: "",
            success: { customers: 3 },
            fail: { customers: -2 },
            starter: false,
            copies: 1
        },
        {
            name: "Outdated Technology",
            type: "Trial",
            subtype: "Phase 2",
            trial: 8,
            text: "",
            success: { customers: 2, promote: 6 },
            fail: { demote: 6 },
            starter: false,
            copies: 1
        },
        {
            name: "Throttled Bandwidth",
            type: "Trial",
            subtype: "Phase 2",
            trial: 9,
            text: "If you have any cards in play that provide Creativity, place one of them in the discard pile before rolling",
            success: { customers: 2, promote: 6 },
            fail: { customers: -1 },
            starter: false,
            copies: 1
        },
        {
            name: "Fire at HQ",
            type: "Trial",
            subtype: "Phase 2",
            trial: 11,
            text: "Add Creativity * I to your roll",
            add: true,
            success: { customers: 3, promote: 0},
            fail: { customers: -1 },
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
            add: true,
            success: { customers: 3, promote: 1 },
            fail: { customers: -1 },
            starter: false,
            copies: 1, 
            pillarIndex: 1, 
            pillarNumeral: 'II'
        },
        {
            name: "Server Crash",
            type: "Trial",
            subtype: "Phase 2",
            trial: 11,
            text: "Add Creativity * III to your roll",
            add: true,
            success: { customers: 3, promote: 2 },
            fail: { customers: -1 },
            starter: false,
            copies: 1, 
            pillarIndex: 2, 
            pillarNumeral: 'III'
        },
        {
            name: "Latency",
            type: "Trial",
            subtype: "Phase 2",
            trial: 11,
            text: "Add Creativity * IV to your roll",
            add: true,
            success: { customers: 3, promote: 3 },
            fail: { customers: -1 },
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
            add: true,
            success: { customers: 3, promote: 4 },
            fail: { customers: -1 },
            starter: false,
            copies: 1, 
            pillarIndex: 4, 
            pillarNumeral: 'V'
        },
        {
            name: "Data Center Migration",
            type: "Trial",
            subtype: "Phase 2",
            trial: 10,
            text: "",
            success: { 
                customers: 1 , 
                custom: "Promote your lowest pillars"
            },
            fail: { customers: -1, demote: 6 },
            starter: false,
            copies: 1
        },
        {
            name: "Employees Poached",
            type: "Trial",
            subtype: "Phase 2",
            trial: 11,
            text: "",
            success: { custom: "Acquire a resource card from the market for free" },
            fail: { custom: "Demote twice" },
            starter: false,
            copies: 1
        },
        {
            name: "Single Point of Failure",
            type: "Trial",
            subtype: "Phase 3",
            trial: 13,
            text: "You must retire a resource in play that provides Creativity or subtract 2 from your roll",
            success: { customers: 3, promote: 4 },
            fail: { customers: -2 },
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
            success: { customers: 4 },
            fail: { customers: -2 },
            starter: false,
            copies: 1
        },
        {
            name: "Failed Rollback",
            type: "Trial",
            subtype: "Phase 3",
            trial: 11,
            text: "Subtract 1 from your roll if your pillar I is not maxed",
            success: { customers: 4, promote: 5 },
            fail: { customers: -1, demote: 6 },
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
            success: { customers: 4, promote: 5 },
            fail: { customers: -2, demote: 6 },
            starter: false,
            copies: 1, 
            pillarIndex: 1, 
            pillarNumeral: 'II'
        },
        {
            name: "Segmentation Fault",
            type: "Trial",
            subtype: "Phase 3",
            trial: 12,
            text: "Subtract 1 from your roll if your pillar III is not maxed",
            success: { customers: 4, promote: 5},
            fail: { customers: -1, demote: 6 },
            starter: false,
            copies: 1, 
            pillarIndex: 2, 
            pillarNumeral: 'III'
        },
        {
            name: "Deadlocks",
            type: "Trial",
            subtype: "Phase 3",
            trial: 12,
            text: "Subtract 1 from your roll if your pillar IV is not maxed",
            success: { customers: 4, promote: 5 },
            fail: { customers: -1, demote: 6 },
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
            success: { customers: 4, promote: 5},
            fail: { customers: -1, demote: 6 },
            starter: false,
            copies: 1, 
            pillarIndex: 4, 
            pillarNumeral: 'V'
        },
        {
            name: "Unpatched OS",
            type: "Trial",
            subtype: "Phase 3",
            trial: 13,
            text: "+2 to your roll if you spent at least one Credit and at least one Talent this turn",
            success: { customers: 2, custom: "Promote twice" },
            fail: { custom: "Demote your highest non-maxed Pillar" },
            starter: false,
            copies: 1
        },
        {
            name: "Technology Disruption",
            type: "Trial",
            subtype: "Phase 3",
            trial: 14,
            text: "+2 Creativity for each of your maxed pillars",
            success: { 
                customers: 1, 
                custom: "Acquire a card from an opponent's discard pile" 
            },
            fail: {
                custom: "Opponents may put a card from their hand into your discard pile" 
            },
            starter: false,
            copies: 1
        },
        {
            name: "Legal Battle",
            type: "Trial",
            subtype: "Phase 3",
            trial: 15,
            text: "Add Creativity to your roll equal to your lowest pillar",
            success: { 
                customers: 1, 
                custom: "Max one non-maxed pillar" 
            },
            fail: { 
                custom: "The opponent to your right demotes any one of your non-maxed pillars" 
            },
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
            name: "AWS Code Pipeline",
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
            }, 
            info: "AWS CodePipeline is a fully managed continuous delivery service that helps you automate your release pipelines for fast and reliable application and infrastructure updates. CodePipeline automates the build, test, and deploy phases of your release process every time there is a code change, based on the release model you define.",
            href: "https://aws.amazon.com/codepipeline/"
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
            name: "Amazon Elasticache",
            marketing: "Fully managed in-memory data store",
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
            }, 
            href: "https://aws.amazon.com/elasticache/", 
            info: "Amazon ElastiCache allows you to seamlessly set up, run, and scale popular open-Source compatible in-memory data stores in the cloud. Build data-intensive apps or boost the performance of your existing databases by retrieving data from high throughput and low latency in-memory data stores. Amazon ElastiCache is a popular choice for real-time use cases like Caching, Session Stores, Gaming, Geospatial Services, Real-Time Analytics, and Queuing."
        },
        {
            name: "AWS Trusted Advisor",
            marketing: "Reduce Costs, Increase Performance, Improve Security",
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
            }, 
            href: "https://aws.amazon.com/premiumsupport/technology/trusted-advisor/", 
            info: "AWS Trusted Advisor is an online tool that provides you real time guidance to help you provision your resources following AWS best practices. Whether establishing new workflows, developing applications, or as part of ongoing improvement, take advantage of the recommendations provided by Trusted Advisor on a regular basis to help keep your solutions provisioned optimally."
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
            name: "AWS Fargate",
            marketing: "Serverless compute for containers",
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
            }, 
            info: "AWS Fargate is a serverless compute engine for containers that works with both Amazon Elastic Container Service (ECS) and Amazon Elastic Kubernetes Service (EKS). Fargate makes it easy for you to focus on building your applications. Fargate removes the need to provision and manage servers, lets you specify and pay for resources per application, and improves security through application isolation by design.", 
            href: "https://aws.amazon.com/fargate/"
        },
        {
            name: "AWS KMS",
            marketing: "Key Management Service",
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
            }, 
            href: "https://aws.amazon.com/kms/", 
            info: "AWS Key Management Service (KMS) makes it easy for you to create and manage cryptographic keys and control their use across a wide range of AWS services and in your applications. AWS KMS is a secure and resilient service that uses hardware security modules that have been validated under FIPS 140-2, or are in the process of being validated, to protect your keys. AWS KMS is integrated with AWS CloudTrail to provide you with logs of all key usage to help meet your regulatory and compliance needs."
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
            marketing: "Start querying data instantly",
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
            }, 
            info: "Amazon Athena is an interactive query service that makes it easy to analyze data in Amazon S3 using standard SQL. Athena is serverless, so there is no infrastructure to manage, and you pay only for the queries that you run.", 
            href: "https://aws.amazon.com/athena/"
        },
        {
            name: "AWS Autoscaling",
            marketing: "Optimize performance and costs",
            type: "Resource",
            subtype: "Cloud",
            text: "Look at the top card of any trial stack. You may put it on the bottom of that stack face up.",
            cost: "TT",
            starter: false,
            copies: 1,
            category: "Compute",
            action: {
                "Draw": 1
            }, 
            href: "https://aws.amazon.com/autoscaling/", 
            info: "AWS Auto Scaling monitors your applications and automatically adjusts capacity to maintain steady, predictable performance at the lowest possible cost. Using AWS Auto Scaling, it’s easy to setup application scaling for multiple resources across multiple services in minutes."
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
            name: "Amazon Quicksight",
            type: "Resource",
            subtype: "Cloud",
            cost: "TT",
            starter: false,
            copies: 1,
            category: "Analytics", 
            provides: {
                "Credit": 1,
                "Creativity": 1
            }, 
            info: "QuickSight makes it easy and fast to create interactive dashboards and reports for your users. You can securely share those dashboards with anyone in your organization via browsers or mobile devices.", 
            href: "https://aws.amazon.com/quicksight/", 
            marketing: "A fast, cloud-powered business intelligence service"
        },
        {
            name: "Amazon Aurora",
            type: "Resource",
            subtype: "Cloud",
            cost: "$$",
            starter: false,
            copies: 1,
            category: "Database", 
            provides: {
                "Credit": 1,
                "Talent": 1
            }, 
            href: "https://aws.amazon.com/rds/aurora/", 
            info: "MySQL and PostgreSQL-compatible relational database built for the cloud. Performance and availability of commercial-grade databases at 1/10th the cost.", 
            marketing: "High performance managed relational database service"
        },
        {
            name: "AWS CloudFormation",
            marketing: "Model and provision all your cloud infrastructure resources",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "Discard X",
            text: "Then draw X. Then you may retire 1 from your hand.",
            cost: "$TTT",
            starter: false,
            copies: 2,
            category: "Management", 
            href: "https://aws.amazon.com/cloudformation/", 
            info: "AWS CloudFormation provides a common language for you to model and provision AWS and third party application resources in your cloud environment. AWS CloudFormation allows you to use programming languages or a simple text file to model and provision, in an automated and secure manner, all the resources needed for your applications across all regions and accounts. This gives you a single source of truth for your AWS and third party resources."
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
            text: "Demote to retire this from your hand"
        },
        {
            name: "Amazon GuardDuty",
            type: "Resource",
            subtype: "Cloud",
            text: "Reveal this from your hand to prevent an action that affects one of your pillars",
            cost: "T",
            starter: false,
            copies: 1,
            category: "Security", 
            provides: {
                "Creativity": 1
            }, 
            href: "https://aws.amazon.com/guardduty/",
            info: "Amazon GuardDuty is a threat detection service that continuously monitors for malicious activity and unauthorized behavior to protect your AWS accounts and workloads. With the cloud, the collection and aggregation of account and network activities is simplified, but it can be time consuming for security teams to continuously analyze event log data for potential threats.", 
            marketing: "Managed threat detection service"
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
            }, 
            href: "https://aws.amazon.com/shield/", 
            info: "AWS Shield is a managed Distributed Denial of Service (DDoS) protection service that safeguards applications running on AWS. AWS Shield provides always-on detection and automatic inline mitigations that minimize application downtime and latency, so there is no need to engage AWS Support to benefit from DDoS protection. There are two tiers of AWS Shield - Standard and Advanced.",
            marketing: "Managed DDoS protection"
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
            name: "AWS Cloud9",
            marketing: "A cloud IDE for writing, running, and debugging code",
            type: "Resource",
            subtype: "Cloud",
            text: "All opponents discard 1, then you retire 1 from your hand.",
            cost: "$TTT",
            starter: false,
            copies: 1,
            category: "Development", 
            action: {
                "Draw": 1
            }, 
            href: "https://aws.amazon.com/cloud9/",
            info: "AWS Cloud9 is a cloud-based integrated development environment (IDE) that lets you write, run, and debug your code with just a browser. It includes a code editor, debugger, and terminal. Cloud9 comes prepackaged with essential tools for popular programming languages, including JavaScript, Python, PHP, and more, so you don’t need to install files or configure your development machine to start new projects."
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
            marketing: "Run code without thinking about servers.",
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
            },
            href: "https://aws.amazon.com/lambda/", 
            info: "With Lambda, you can run code for virtually any type of application or backend service - all with zero administration. Just upload your code and Lambda takes care of everything required to run and scale your code with high availability. You can set up your code to automatically trigger from other AWS services or call it directly from any web or mobile app."
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
            name: "Amazon Simple Queue Service",
            type: "Resource",
            subtype: "Cloud",
            bigtext: "Discard 1",
            text: "Then draw 1",
            cost: "$",
            starter: false,
            copies: 2,
            category: "Integration", 
            href: "https://aws.amazon.com/sqs/",
            info: "Amazon Simple Queue Service (SQS) is a fully managed message queuing service that enables you to decouple and scale microservices, distributed systems, and serverless applications. SQS eliminates the complexity and overhead associated with managing and operating message oriented middleware, and empowers developers to focus on differentiating work.", 
            marketing: "Fully managed message queuing service"
        },
        {
            name: "Amazon Elastic Block Store",
            type: "Resource",
            subtype: "Cloud",
            text: "Then discard 1 from your hand",
            cost: "$$",
            starter: false,
            copies: 1,
            category: "Storage", 
            action: {
                "Draw": 2
            }, 
            info: "Amazon Elastic Block Store (EBS) is an easy to use, high performance block storage service designed for use with Amazon Elastic Compute Cloud (EC2) for both throughput and transaction intensive workloads at any scale. A broad range of workloads, such as relational and non-relational databases, enterprise applications, containerized applications, big data analytics engines, file systems, and media workflows are widely deployed on Amazon EBS.", 
            href: "https://aws.amazon.com/ebs", 
            marketing: "Easy to use, high performance block storage at any scale"
        },
        {
            name: "Stack Overflow",
            type: "Resource",
            subtype: "Bug",
            cost: "T",
            starter: false,
            copies: 2, 
            text: "Lose 1 customer to retire this from your hand"
        },
        {
            name: "Off By 1",
            type: "Resource",
            subtype: "Bug",
            text: "Discard 1 from hand to retire this",
            cost: "T",
            starter: false,
            copies: 2
        },
        {
            name: "Amazon VPC",
            type: "Resource",
            subtype: "Cloud",
            cost: "TT",
            starter: false,
            copies: 2,
            category: "Networking", 
            provides: {
                "Creativity": 2
            }, 
            href: "https://aws.amazon.com/vpc/", 
            info: "Amazon Virtual Private Cloud (Amazon VPC) lets you provision a logically isolated section of the AWS Cloud where you can launch AWS resources in a virtual network that you define. You have complete control over your virtual networking environment, including selection of your own IP address range, creation of subnets, and configuration of route tables and network gateways. You can use both IPv4 and IPv6 in your VPC for secure and easy access to resources and applications.", 
            marketing: "Virtual Private Cloud"
        },
        {
            name: "Amazon Simple Storage Service",
            type: "Resource",
            subtype: "Cloud",
            text: "Then retire 1",
            cost: "TT",
            starter: false,
            copies: 1,
            category: "Storage", 
            action: {
                "Draw": 1
            }, 
            href: "https://aws.amazon.com/s3/", 
            info: "Amazon Simple Storage Service (Amazon S3) is an object storage service that offers industry-leading scalability, data availability, security, and performance. This means customers of all sizes and industries can use it to store and protect any amount of data for a range of use cases, such as websites, mobile applications, backup and restore, archive, enterprise applications, IoT devices, and big data analytics.", 
            marketing: "Store and retrieve any amount of data from anywhere"
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
            name: "AWS WAF",
            type: "Resource",
            subtype: "Cloud",
            text: "Reveal this from your hand to prevent a discard from affecting you",
            cost: "$$",
            starter: false,
            copies: 1,
            category: "Security", 
            provides: {
                "Creativity": 1
            }, 
            href: "https://aws.amazon.com/waf/", 
            marketing: "Web Application Firewall", 
            info: "AWS WAF is a web application firewall that helps protect your web applications or APIs against common web exploits that may affect availability, compromise security, or consume excessive resources. AWS WAF gives you control over how traffic reaches your applications by enabling you to create security rules that block common attack patterns, such as SQL injection or cross-site scripting, and rules that filter out specific traffic patterns you define."
        },
        {
            name: "AWS X-Ray",
            type: "Resource",
            subtype: "Augment Cloud",
            cost: "$T",
            starter: false,
            copies: 1,
            category: "Development", 
            provides: {
                "Creativity": 1
            }, 
            marketing: "Analyze and debug your applications", 
            href: "https://aws.amazon.com/xray/", 
            info: "AWS X-Ray helps developers analyze and debug production, distributed applications, such as those built using a microservices architecture. With X-Ray, you can understand how your application and its underlying services are performing to identify and troubleshoot the root cause of performance issues and errors. "
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
            name: "Amazon Forecast",
            marketing: "Accurate time-series forecasting service",
            type: "Resource",
            subtype: "Cloud",
            text: "Look at the top card of any trial stack. If you pass a trial this turn, gain an extra customer",
            cost: "$TT",
            starter: false,
            copies: 2,
            category: "AI-ML", 
            action: {
                "Draw": 1
            }, 
            href: "https://aws.amazon.com/forecast/",
            info: "Based on the same technology used at Amazon.com, Amazon Forecast uses machine learning to combine time series data with additional variables to build forecasts. Amazon Forecast requires no machine learning experience to get started. You only need to provide historical data, plus any additional data that you believe may impact your forecasts."
        },
        {
            name: "Amazon Sagemaker",
            marketing: "Machine learning for every developer and data scientist",
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
            },
            href: "https://aws.amazon.com/sagemaker/", 
            info: "Amazon SageMaker is a fully managed service that provides every developer and data scientist with the ability to build, train, and deploy machine learning (ML) models quickly. SageMaker removes the heavy lifting from each step of the machine learning process to make it easier to develop high quality models."
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