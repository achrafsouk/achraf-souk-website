// Sample data for development and testing
export const sampleData = {
    profile: {
        name: "Achraf Souk 🙋‍♂️",
        bio: "Currently, I am a Principal Solutions Architect at AWS with more than 15 years of experience in cloud, security, and networking. I enjoy building and scaling presales technical organizations, working with customers across industries in EMEA to design resilient, fast, and secure web applications, and simplifying deeply technical topics for wider audiences.",
        profileImage: {
            src: "images/profile.jpg",
            alt: "Achraf Souk profile picture",
            fallbackInitials: "AS"
        },
        linkedinUrl: "https://www.linkedin.com/in/achrafsouk/"
    },

    achievements: [
        {
            id: "achievement-1",
            title: "Built a high perfoming Solutions Architect team at AWS",
            description: "Over a five-year period, I built and led a Specialist Solutions Architect organization supporting hundreds of millions of dollars in annual EMEA revenue. I established the team mechanisms from the ground up, scaled talent through hiring and career development, and drove performance to the highest quota attainment among peer teams worldwide.", 
            order: 1
        },
        {
            id: "achievement-2",
            title: "Scaled a global technical community at AWS",
            description: "Over a three-year period, I led a turnaround of a global technical community at AWS, amid 230% demand growth, redesigning its operating model, leadership structure, and data foundations. I shifted the organization from reactive execution to sustained community growth, scaling it from 46 to 176 members to meet the growth in customer engagements, while achieving the highest community KPIs (e.g. active members, NPS, etc..",
            order: 2
        },
        {
            id: "achievement-3",
            title: "Established content strategy of the AWS edge domain",
            description: "I raised the bar of content creation in the edge domain, by creating a new execution model based on focus groups with processes to work backwards from customer signals to define content readmap, and drive delivery to pre-established content platforms. The program helped define and deliver most 80+ content projects in one year.",
            order: 3
        },
        {
            id: "achievement-4",
            title: "Edge developer protal",
            description: "I conceived and delivered a scalable knowledge platform that consolidated fragmented Edge expertise into curated, opinionated guidance for customers and field teams. I secured cross-org sponsorship, drove PRFAQ approval to launch the platform on aws.amazon.com, and established a sustainable content-governance model. It now attracts 500–1,500 daily visits.",
            order: 4
        },
        {
            id: "achievement-5",
            title: "Influenced AWS roadmap",
            description: "I closely partnered with service teams to shape the AWS roadmap, by establishing Voice of the Field feedback loop, and contributing to PRFAQ processes. I partnered on features releases such as CloudFront Origin Shield, built business case for infrastructure expansion such as in the Middle East, and triggered improvement programs such latency decrease and enhacemens to developer experience.",
            order: 5
        },
        {
            id: "achievement-6",
            title: "Organized public facing security events",
            description: "I organized impactful public events targeting security professionals of AWS customers. I defined the content, selected speakers, managed customer invitation, and all logistics. Events include: AWS Riyadh Security Day 2025 (100+ attendees) and AWS Security Builder Circle in the UAE (50+ attendees).",
            order: 6
        }
    ],

    content: [
        {
            id: "content-1",
            title: "Stockholm PoP Up loft - Customize your content delivery with Lambda@Edge",
            type: "talk",
            publicationDate: "2018-10-15",
            description: "Join us in this session to learn more about Lambda@Edge: it's availability in the Nordics, use cases from customers like Blockbuster, examples of implementations and best practices.",
            externalLink: "content/slides-customize-your-delivery-with-lambda@edge.pdf"
        },
        {
            id: "content-2",
            title: "AWS re:Invent 2018 - Optimizing Lambda@Edge for Performance and Cost Efficiency",
            type: "talk",
            publicationDate: "2018-11-26",
            description: "Do you want to know how Lambda@Edge could fit into your environment? In this session, join our engineers to discuss Lambda@Edge best practices throughout the lifecycle of your application, and bring your questions. Topics include how to create the best Lambda@Edge design for your use case, how to integrate Lambda@Edge in your CI/CD pipeline, and how to make sure your solution is working well and addressing your business need.",
            externalLink: "content/slides-optimizing-lambda@Edge-for-performance-and-cost-efficiency.pdf"
        },
        {
            id: "content-3",
            title: "AWS re:Invent 2018 - How Rovio Uses Amazon CloudFront for Secure API Acceleration",
            type: "talk",
            publicationDate: "2018-11-26",
            description: "Join this session to learn how Rovio improved performance and security for their APIs using CloudFront and AWS edge security services.",
            externalLink: "content/slides-how-rovio-uses-amazon-cloudfront-for-secure-api-acceleration.pdf"
        },
        {
            id: "content-4",
            title: "AWS re:Invent 2019 - Building serverless micro frontends at the edge",
            type: "talk",
            publicationDate: "2019-12-07",
            description: "Your users expect a fast and dynamic web experience, but this can be a challenge when you have thousands of users across the globe. How can you balance low-latency delivery and content personalization while scaling seamlessly to meet user demand? In this session, learn how to use Amazon CloudFront and Lambda@Edge to personalize your website, harden its security, and do canary releases and agile deployments. Hear from DAZN, a global sports streaming platform, about how it built serverless micro frontends on AWS.",
            externalLink: "https://www.youtube.com/watch?v=fT-5RHTtFNg"
        },
        {
            id: "content-5",
            title: "AWS Best Practices for DDoS Resiliency",
            type: "whitepaper",
            publicationDate: "2023-08-09",
            description: "In this whitepaper, AWS provides you with prescriptive DDoS guidance to improve the resiliency of applications running on AWS, including a DDoS-resilient reference architecture that can be used as a guide to help protect application availability.",
            externalLink: "https://docs.aws.amazon.com/whitepapers/latest/aws-best-practices-ddos-resiliency/aws-best-practices-ddos-resiliency.html"
        },
        {
            id: "content-6",
            title: "Managing Lambda@Edge and CloudFront deployments by using a CI/CD pipeline",
            type: "blog",
            publicationDate: "2018-12-17",
            description: "In this new blog post I’m sharing some best practices for rolling out code or configuration changes to a Lambda@Edge function and Amazon CloudFront distribution in a safe and controlled way,",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/managing-lambdaedge-and-cloudfront-deployments-by-using-a-ci-cd-pipeline/"
        },
        {
            id: "content-7",
            title: "Lambda@Edge Design Best Practices",
            type: "blog",
            publicationDate: "2018-05-14",
            description: "In this first post, I’ll share some common use cases when our customers have implemented Lambda@Edge solutions, explain how to choose when to trigger a Lambda@Edge function, and, finally, provide recommendations to optimize performance and cost efficiency when you’re working with Lambda@Edge.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/lambdaedge-design-best-practices/"
        },
        {
            id: "content-8",
            title: "Serving Private Content Using Amazon CloudFront & AWS Lambda@Edge",
            type: "blog",
            publicationDate: "2018-06-14",
            description: "In this blog post, I will show you how to configure your Amazon CloudFront distribution using Lambda@Edge to serve private content from your own custom origin.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/serving-private-content-using-amazon-cloudfront-aws-lambdaedge/"
        },
        {
            id: "content-9",
            title: "AWS Stockholm Summit 1019 - A few milliseconds in the life of an HTTP Request on AWS edge network",
            type: "talk",
            publicationDate: "2019-05-22",
            description: "In Amazon CloudFront, a lot happens in just a few milliseconds. Join us for a dive deep into the infrastructure and architecture of the AWS edge services, including Amazon CloudFront, Lambda@Edge, AWS Shield, and AWS WAF. We break down the life of an HTTP request, and any request in general, and walk you through how each of the AWS edge services work together in just a few milliseconds to consistently deliver your application’s content with high availability, security, and performance. You will also hear from Acast how they leverage AWS Edge services to accelerate and protect various public endpoints, and specifically how they use Lambda@Edge to solve some real life problems!",
            externalLink: "content/slides-a-few-milliseconds-in-the-life-of-an-http-request-on-aws-edge-network.pdf"
        },
        {
            id: "content-10",
            title: "AWS Media Symposium Stockholm 2019",
            type: "talk",
            publicationDate: "2019-05-22",
            description: "Best practices for using CloudFront in a Video Streaming use case.",
            externalLink: "content/slides-media-symposium-chalk-talk.pdf"
        },
        {
            id: "content-11",
            title: "AWS Paris Summit 2019 - Protéger son application en ligne des attaques volumétriques et applicatives",
            type: "talk",
            publicationDate: "2019-04-10",
            description: "Une application exposée sur internet risque de se faire attaquer pour la rendre indisponible (DDoS), la compromettre à travers un exploit de code ou voler des informations avec des bots malicieux. Dans cette session vous apprenez à utiliser des services AWS comme Amazon CloudFront, AWS WAF et AWS Shield pour se protéger contre ces attaques. Vous apprenez également comment DataDome protège ses clients des bots malicieux avec leur solution basée sur CloudFront et Lambda@Edge.",
            externalLink: "https://www.youtube.com/watch?v=meEdb5ltvOc"
        },
        {
            id: "content-12",
            title: "AWS Paris Summit 2019 - Améliorer l’architecture de votre application en ligne grâce au CDN Amazon CloudFront",
            type: "talk",
            publicationDate: "2019-04-10",
            description: "Le CDN Amazon CloudFront est une brique essentielle dans l'architecture d'une application HTTP(S) exposée sur internet.  Si vous opérez un site web, une API, du streaming vidéo ou du téléchargement de fichiers comme des logiciels ou des jeux vidéo, vous bénéficierez de CloudFront. Dans cette session, vous apprenez à utiliser CloudFront à fin d’optimiser votre architecture en terme de performances, de sécurité, de fiabilité, d'optimisation de coûts et d'excellence opérationnelle.",
            externalLink: "https://www.youtube.com/watch?v=gbl4QSCQPNg"
        },
        {
            id: "content-13",
            title: "AWS Paris Summit 2019 - Améliorer l’architecture de votre application en ligne grâce au CDN Amazon CloudFront",
            type: "talk",
            publicationDate: "2019-04-10",
            description: "Le CDN Amazon CloudFront est une brique essentielle dans l'architecture d'une application HTTP(S) exposée sur internet.  Si vous opérez un site web, une API, du streaming vidéo ou du téléchargement de fichiers comme des logiciels ou des jeux vidéo, vous bénéficierez de CloudFront. Dans cette session, vous apprenez à utiliser CloudFront à fin d’optimiser votre architecture en terme de performances, de sécurité, de fiabilité, d'optimisation de coûts et d'excellence opérationnelle.",
            externalLink: "https://www.youtube.com/watch?v=gbl4QSCQPNg"
        },
        {
            id: "content-14",
            title: "Using multiple content delivery networks for video streaming – part 1",
            type: "blog",
            publicationDate: "2019-10-15",
            description: "I will explain how a content delivery network (CDN) like Amazon CloudFront can improve your video delivery quality, and whether using multiple CDNs is beneficial for your company to improve quality further.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/using-multiple-content-delivery-networks-for-video-streaming-part-1/"
        },
        {
            id: "content-15",
            title: "Leveraging external data in Lambda@Edge",
            type: "blog",
            publicationDate: "2019-07-03",
            description: "In this article, I will guide you through common patterns and options for reading external data in Lambda@Edge functions.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/leveraging-external-data-in-lambdaedge/"
        },
        {
            id: "content-16",
            title: "Four Steps for Debugging your Content Delivery on AWS",
            type: "blog",
            publicationDate: "2019-06-20",
            description: "In this blog, I provide four steps that guide you in debugging AWS content delivery issues.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/four-steps-for-debugging-your-content-delivery-on-aws/"
        },
        {
            id: "content-17",
            title: "Improve your website performance with Amazon CloudFront",
            type: "blog",
            publicationDate: "2020-03-10",
            description: " In this post, you will learn how to fine-tune your website’s performance even further by leveraging these optimization options available on CloudFront.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/improve-your-website-performance-with-amazon-cloudfront/"
        },
        {
            id: "content-18",
            title: "Using multiple content delivery networks for video streaming – part 2",
            type: "blog",
            publicationDate: "2020-02-06",
            description: "In this part, I will guide you through important questions to consider when deploying a system to route traffic across multiple CDNs.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/using-multiple-content-delivery-networks-for-video-streaming-part-2/"
        },
        {
            id: "content-19",
            title: "Pernod Ricard: Shortening URLs on a Global Scale with Low Latency",
            type: "talk",
            publicationDate: "2020-03-04",
            description: "Charles from Pernod Ricard explains how the company built a low-latency URL shortener service that’s used every time a consumer scans the QR code of a beverage bottle produced by Pernod Ricard Group.",
            externalLink: "https://www.youtube.com/watch?v=F4KDOGNpSoI"
        },
        {
            id: "content-19",
            title: "Guidelines for Implementing AWS WAF",
            type: "whitepaper",
            publicationDate: "2022-01-19",
            description: "This whitepaper outlines recommendations for implementing AWS WAF to protect existing and new web applications.",
            externalLink: "https://docs.aws.amazon.com/pdfs/whitepapers/latest/guidelines-for-implementing-aws-waf/guidelines-for-implementing-aws-waf.pdf"
        },
        {
            id: "content-20",
            title: "Serving SSE-KMS encrypted content from S3 using CloudFront",
            type: "blog",
            publicationDate: "2020-05-15",
            description: "In this blog post, you will quickly go through the available encryption options in S3 and CloudFront. Then, learn how to implement one of these options (SSE-KMS) in S3 when using CloudFront for content delivery.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/serving-sse-kms-encrypted-content-from-s3-using-cloudfront/"
        },
        {
            id: "content-21",
            title: "Marianne – Une infrastructure serverless pour mieux servir les lecteurs",
            type: "blog",
            publicationDate: "2021-05-26",
            description: "Grâce à AWS le temps de crawl moyen du site du magazine Marianne est passé de 700 ms à 270 ms, le trafic a augmenté de 41% et les coûts ont été réduits de 40%.",
            externalLink: "https://aws.amazon.com/fr/blogs/france/marianne-une-infrastructure-serverless-pour-mieux-servir-les-lecteurs/"
        },
        {
            id: "content-22",
            title: "Dynamic Request Routing in Multi-tenant Systems with Amazon CloudFront",
            type: "blog",
            publicationDate: "2021-04-19",
            description: "In this blog post, we will share how OutSystems designed a globally distributed serverless request routing service for their multi-tenant architecture.",
            externalLink: "https://aws.amazon.com/blogs/architecture/dynamic-request-routing-in-multi-tenant-systems-with-amazon-cloudfront/"
        },
        {
            id: "content-23",
            title: "CloudFront Migration Series (Part 3): OLX Europe, The DevOps Way",
            type: "blog",
            publicationDate: "2021-02-24",
            description: "In this blog, we are sharing our content delivery network migration story for OLX Europe – which focuses on trading used goods.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/cloudfront-migration-series-part-3-olx-europe-the-devops-way/"
        },
        {
            id: "content-24",
            title: "Field Notes: How OLX Europe Fights Millions of Bots with AWS",
            type: "blog",
            publicationDate: "2021-03-08",
            description: "In this blog,  we will share the details of OLX’s edge security architecture to enhance their bot protection.",
            externalLink: "https://aws.amazon.com/blogs/architecture/field-notes-how-olx-europe-fights-millions-of-bots-with-aws/"
        },
        {
            id: "content-25",
            title: "Well-Architecting online applications with CloudFront and AWS Global Accelerator",
            type: "blog",
            publicationDate: "2022-07-26",
            description: "In this blog, I explain how online applications can be well-architected using CloudFront and Global Accelerator.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/well-architecting-online-applications-with-cloudfront-and-aws-global-accelerator/"
        },
        {
            id: "content-26",
            title: "Three advanced design patterns for high available applications using Amazon CloudFront",
            type: "blog",
            publicationDate: "2022-07-12",
            description: "In this advanced technical post, we’ll explore three design patterns that you can use for building high available web applications. You’ll learn about hybrid origin failover, graceful failure, and static stability.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/three-advanced-design-patterns-for-high-available-applications-using-amazon-cloudfront"
        },
        {
            id: "content-27",
            title: "Image Optimization using Amazon CloudFront and AWS Lambda",
            type: "blog",
            publicationDate: "2022-11-14",
            description: "In the blog post, we provide you with a simple and performant solution for image optimization using serverless components such as Amazon CloudFront, Amazon S3 and AWS Lambda.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/image-optimization-using-amazon-cloudfront-and-aws-lambda/"
        },
        {
            id: "content-28",
            title: "UAE Cloud day 2023 - Optimize & secure user experience with AWS edge services",
            type: "talk",
            publicationDate: "2023-09-12",
            description: "It's an introduction to AWS Edge services and their benefit to engineers who are managing or designing any web property exposed to the internet.",
            externalLink: "content/slides-uae-cloud-day-cmp201-optimize-secure-user-experience-with-aws-edge-services.pdf"
        },
        {
            id: "content-29",
            title: "AWS Perimeter Protection Roadshow 2023 - Dubai",
            type: "talk",
            publicationDate: "2023-06-14",
            description: "In this session, our Edge Services Specialist Solutions Architect will explain the sorts of challenges we see our customers focusing on, and provide best practice guidance on how to approach them with AWS Shield, AWS WAF and AWS Firewall Manager.",
            externalLink: "content/slides-emea-perimeter-protection-roadshow-dubai.pdf"
        },
        {
            id: "content-30",
            title: "AWS re:Invent 2023 - Ask the experts: Edge compute with Amazon CloudFront",
            type: "talk",
            publicationDate: "2023-11-28",
            description: "Join this chalk talk to find out how you can implement advanced business logic at the edge and provide faster experiences to end users using Amazon CloudFront functions and Lambda@Edge. Learn how to deploy advanced logic such as authorization, A/B testing, and SEO-related HTTP redirections. Explore different strategies on how to manage state in edge functions—a key requirement for implementing advanced customizations.",
            externalLink: "https://d1.awsstatic.com/events/Summits/reinvent2023/NET307-R_Ask-the-experts-Edge-compute-with-Amazon-CloudFront-REPEAT.pdf"
        },
        {
            id: "content-31",
            title: "AWS re:Invent 2023 - Digging into AWS network performance",
            type: "talk",
            publicationDate: "2023-11-28",
            description: "Join this chalk talk to learn about best practices to measure and optimze network performance, from the origin servers in AWS regions, to edge locations, to users.",
            externalLink: "https://d1.awsstatic.com/events/Summits/reinvent2023/NET323_Digging-into-AWS-network-performance.pdf"
        },
        {
            id: "content-32",
            title: "Using AWS WAF intelligent threat mitigations with cross-origin API access",
            type: "blog",
            publicationDate: "2023-07-13",
            description: "Learn how to configure the AWS WAF SDK in a cross-origin setup.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/using-aws-waf-intelligent-threat-mitigations-with-cross-origin-api-access/"
        },
        {
            id: "content-33",
            title: "Le Podcast AWS en Français - Amazon CloudFront",
            type: "talk",
            publicationDate: "2024-02-06",
            description: "Une conversation sur le pourquoi et le comment utiliser un CDN.",
            externalLink: "https://www.youtube.com/watch?v=Bu4B2SYkBP8"
        },
        {
            id: "content-34",
            title: "Accelerate and protect your websites using Amazon CloudFront and AWS WAF",
            type: "blog",
            publicationDate: "2023-09-12",
            description: "In this post, you learn the basic concepts of configuring CloudFront and AWS WAF to add them to your web application technology stack.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/accelerate-and-protect-your-websites-using-amazon-cloudfront-and-aws-waf/"
        },
        {
            id: "content-35",
            title: "How to boost the performance and security of your dynamic websites with AWS edge services in a few steps",
            type: "blog",
            publicationDate: "2023-09-26",
            description: " In this post, you deploy just a few clicks, using an AWS CloudFormation template, an Amazon CloudFront distribution as a reverse proxy to your origin servers, protected by an AWS WAF WebACL.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/how-to-boost-the-performance-and-security-of-your-dynamic-websites-with-aws-edge-services-in-a-few-steps/"
        },
        {
            id: "content-36",
            title: "Introducing CloudFront Hosting Toolkit",
            type: "blog",
            publicationDate: "2024-06-04",
            description: "Today, we released the CloudFront Hosting Toolkit, an open source command line interface (CLI) tool to help you deploy fast and secure front-ends in the cloud. Install the CloudFront Hosting Toolkit CLI through npm, run two commands, and CloudFront Hosting Toolkit CLI automatically creates the deployment pipeline and infrastructure needed to build, deploy, and serve your front-end application following each Git push.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/introducing-cloudfront-hosting-toolkit/"
        },
        {
            id: "content-37",
            title: "Deploy frontends with the CloudFront Hosting Toolkit",
            type: "talk",
            publicationDate: "2024-06-25",
            description: "Join this webinar to learn how the toolkit offers the convenience of a managed frontend hosting service while retaining full control over the hosting and deployment infrastructure.",
            externalLink: "https://www.youtube.com/watch?v=A_lRY3W5V2E"
        },
        {
            id: "content-37",
            title: "Fast & secure e-commerce demo",
            type: "article",
            publicationDate: "2024-08-22",
            description: "This project is a fictitious online retail store that is accelerated by Amazon CloudFront and protected with AWS WAF, both part of AWS edge services. It's an educational project, that helps developers in understanding the capabilities of these services. It can be used as a demo tool, and as a testing sandbox.",
            externalLink: "https://github.com/aws-samples/fast-secure-ecommerce-demo"
        },
        {
            id: "content-38",
            title: "How Ebebek leverages AWS edge network with Amazon CloudFront",
            type: "talk",
            publicationDate: "2024-09-29",
            description: "Join us to hear how Ebebek use AWs Edge services to improve their web delivery while reducing their costs.",
            externalLink: "content/slides-turkey-cloud-day-2024-cloudFront-session.pdf"
        },
        {
            id: "content-39",
            title: "Winning the DDoS battle",
            type: "article",
            publicationDate: "2025-11-01",
            description: "This workshop will take you through the methodologies at your disposal for protecting your web applications against DDoS attacks. It is relevant for people running web applications or services, managing CDN (Content Delivery Network) configurations, WAF (web application firewalls) or anti-DDoS controls.",
            externalLink: "https://catalog.workshops.aws/winning-the-ddos-battle/en-US"
        },
        {
            id: "content-40",
            title: "Securing PartyRock: How we protect Amazon Bedrock endpoints using AWS WAF",
            type: "blog",
            publicationDate: "2024-11-07",
            description: "In this post, we explore how we used AWS WAF to protect PartyRock from potential threats such as Distributed Denial of Service (DDoS) and Denial of Wallet (DoW). In this post, developers who are integrating generative AI capabilities into their online applications can learn about concrete AWS WAF-based techniques to protect their applications from similar threats.",
            externalLink: "https://aws.amazon.com/blogs/networking-and-content-delivery/securing-partyrock-how-we-protect-amazon-bedrock-endpoints-using-aws-waf/"
        },
        {
            id: "content-41",
            title: "Build on AWS UAE: Migrating Web Delivery to AWS",
            type: "talk",
            publicationDate: "2024-12-13",
            description: "In this webinar learn about the AWS infrastructure investments in the UAE and how customers in the region are building applications that are faster and more secure. Learn how to migrate to native web delivery on aws.",
            externalLink: "https://www.youtube.com/watch?v=4YOFI7ZSVrI"
        },
        {
            id: "content-42",
            title: "AWS re:Invent 2024 - Amazon CloudFront Hosting Toolkit: A new tool for frontend hosting",
            type: "talk",
            publicationDate: "2024-12-05",
            description: "In this lightning talk, explore the Amazon CloudFront Hosting Toolkit—an open source CLI tool designed to simplify the deployment of self-managed frontends on AWS. Discover how this powerful tool operates and learn how to leverage it for deploying secure and fast frontends using Git-based workflows, while retaining full control over underlying AWS resources.",
            externalLink: "https://www.youtube.com/watch?v=pmWhspx4ppw"
        },
        {
            id: "content-43",
            title: "AWS re:Invent 2024 - Fast web delivery: Expert insights into Amazon CloudFront",
            type: "talk",
            publicationDate: "2024-12-11",
            description: "Interested in delivering fast web experiences that keep users coming back? With the latest advancements in web protocols and Amazon CloudFront capabilities, there’s lots to consider when delivering web applications online. Bring your toughest questions around delivery topics like caching, dynamic content acceleration, or data transfer optimization. The CloudFront experts kick off the discussion with single domain architecture and API delivery topics and then dive deep into your specific challenges to provide tailored solutions for your unique web application workloads.",
            externalLink: "https://www.youtube.com/watch?v=zuhmzaqoUl0"
        },
        {
            id: "content-44",
            title: "SMS Pumping: The multi-billion dollar fraud",
            type: "article",
            publicationDate: "2025-04-13",
            description: "Learn more about SMS Pumping fraud, and how you can protect your SMS generating endpoints against this threat.",
            externalLink: "https://builder.aws.com/content/2vfSFa2GJm8j9w88hfp9gH56wl4/sms-pumping-the-multi-billion-dollar-fraud"
        },
        {
            id: "content-45",
            title: "Integrating AWS WAF Mobile SDK in iOS",
            type: "article",
            publicationDate: "2025-04-17",
            description: "Learn how to use the AWS WAF Mobile SDK in a sample iOS project.",
            externalLink: "https://builder.aws.com/content/2vrIbVVDdUvLJU6pMuzFtotFagB/integrating-aws-waf-mobile-sdk-in-ios"
        },
        {
            id: "content-46",
            title: "How to customize your response to layer 7 DDoS attacks using AWS WAF Anti-DDoS AMR",
            type: "blog",
            publicationDate: "2025-04-17",
            description: "In this post, you’ll learn how the Anti-DDoS AMR works, and how you can customize its behavior using labels and additional AWS WAF rules. You’ll walk through three practical scenarios, each demonstrating a different customization technique.",
            externalLink: "https://aws.amazon.com/blogs/security/how-to-customize-your-response-to-layer-7-ddos-attacks-using-aws-waf-anti-ddos-amr/"
        },
        {
            id: "content-47",
            title: "How AWS's global threat intelligence transforms cloud protection",
            type: "talk",
            publicationDate: "2025-09-23",
            description: "Learn more about how AWS gathers threat intelligence, example of threats detected by AWS, and how you can benefit from this intelligence using AWS services.",
            externalLink: "content/slides-aws-threat-intelligence-security-builder-circle-h2-2024.pdf"
        },
        {
            id: "content-48",
            title: "New Releases in AWS Edge Security",
            type: "talk",
            publicationDate: "2025-02-18",
            description: "Learn more about the latest edge security updates from re:Invent 2024.",
            externalLink: "content/slides-edge-security-security-builder-circle-h1-2024.pdf"
        },
        {
            id: "content-49",
            title: "Thinking about application security right from the edge",
            type: "talk",
            publicationDate: "2025-01-26",
            description: "Annoucing the new CloudFront location in KSA, and the new Anti-DDoS managed rule in AWS WAF.",
            externalLink: "content/slides-ksa-riyadh-security-day-2024.pdf"
        },
        {
            id: "content-50",
            title: "Introducing AWS Edge location in Qatar",
            type: "talk",
            publicationDate: "2024-11-01",
            description: "Annoucing the new CloudFront edge pop in Doha Qatar.",
            externalLink: "content/slides-qatar-pop-launch.pdf"
        },
        {
            id: "content-51",
            title: "Introducing AWS Edge location in Egypt",
            type: "talk",
            publicationDate: "2024-05-25",
            description: "Annoucing the new CloudFront edge pop in Cairo Egypt.",
            externalLink: "content/slides-egypt-pop-launch.pdf"
        },
        {
            id: "content-52",
            title: "AWS Dubai Summit 2025 - AWS security at scale: From development to production",
            type: "talk",
            publicationDate: "2025-05-21",
            description: "Discover how to enhance cloud security across your development and production lifecycle. Explore AWS's comprehensive security approach—from identification and prevention to detection, response, and remediation. Learn to integrate security-by-design principles and use advanced detection capabilities. See how generative AI enhances security analysis and automation. Gain insights into building resilient architectures that evolve with emerging threats.",
            externalLink: "content/slides-aws-dubai-summit-2025-security-at-scale-from-development-to-production.pdf"
        },
    ]
};

