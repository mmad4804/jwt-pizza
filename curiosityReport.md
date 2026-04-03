# Curiosity Report: Exploring Terraform
I first heard about Terraform a year ago among some of my classmates who were using it. No one ever fully explained what it was though, and I have to admit that my concept of it was very nebulous at best. When it was again mentioned in this course as an alternative to AWS CloudFormation, I decided it would be worth investigating. I will also be comparing and contrasting what it has to offer with other similar tools out there.

## Overview of Terraform
Terraform is an Infrastructure-As-Code tool, meaning that it enables developers to write human-readable files that automate all the infrastructure configuration and resource deployment needed for a software application/project. One of its biggest selling points is that it is platform agnostic, integrating easily with any number of existing services you may be using. I also appreciate how Terraform works by a declarative model: you define the desired final state of your resources, and it offers the plan of how to build that infrastructure. It essentially handles the underlying logic for you.

Some other benefits of using Terraform include:
- *Collaboration*: working with a team to define and update these resources becomes much easier when there's a shared file that can be versioned and tracked, as opposed to manual configurations on individual consoles.
- *Speed*: toil is greatly reduced when a whole infrastructure can be spun up by running a script. Not to mention, bouncing back from failures/disasters becomes much simpler and reduces errors.
- *Drift Detection*: developers provide files describing the original state of the infrastructure for tracking so that when manual changes are made, the environment can be restored to its intended configuration.

## Comparisons
Below is a table comparing Terraform's capabilities with a few other leading infrastructure-as-code tools. Personally, while many of my class projects have worked primarily within Amazon's cloud, I hope to expand my experience with other providers as well. It was insightful to conduct a preliminary investigation into some of these other options and see how each is structured in a way to be the prime solution for different use cases.

|                | Pros of Competitor                                                                                  | What Terraform Offers                                                                    |
|----------------|-----------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| Ansible        | - Manual provisioning means<br>greater control                                                      | - Automated provisioning<br>increases ease<br>- Can build infrastructure<br>from scratch |
| Pulumi         | - Greater flexibility with<br>coding guidelines<br>- Not limited to a specific<br>software language | - A larger community with<br>more documentation                                          |
| CloudFormation | - Offers deep, native integration<br>with AWS services                                              | - Flexibility beyond AWS-<br>can integrate multiple <br>cloud services/providers         |

## Tutorial
To get a feel for how Terraform works, I followed one of the tutorials on their website (https://developer.hashicorp.com/terraform/tutorials/docker-get-started/infrastructure-as-code) for building a simple docker infrastructure using Terraform.

### Installation
One of the first steps was to install Terraform on my local machine, which I did using Chocolatey:

` choco install terraform `

### Configuration File
I then defined my infrastructure with a basic configuration file. We begin by selecting one or many _providers_ within the Terraform settings block. According to Terraform's website, providers are essentially plugins that "let Terraform interact with cloud platforms and other services via their application programming interfaces (APIs)" <sup>3</sup>. You can even write your own providers that integrate with Terraform! In this case, we chose docker as the provider of our infrastructure. Additional configuration for it can be made in the `provider` block.

<img width="1582" height="959" alt="image" src="https://github.com/user-attachments/assets/de5a5e8b-68a2-4328-a895-750be678b2cd" />

*Resources* are the other main building block for defining your infrastructure. Before each block, the resource type and name are listed. Within each block, I supplied the arguments for configuring the resources, such as instructing the docker container to use the docker image.

Running `terraform init` in the terminal installs the necessary providers, and `terraform apply` creates an execution plan for review.

<img width="1491" height="772" alt="image" src="https://github.com/user-attachments/assets/50b196fa-9fb5-4e24-b44c-2213087023e7" />

After accepting the plan, Terraform went ahead and provisioned the resources, successfully creating the docker container! Navigating to `localhost:8000` on the browser verified that the setup was successful. 

<img width="957" height="348" alt="image" src="https://github.com/user-attachments/assets/82e2912c-cff6-4639-9b1c-af128c90c792" />

## Final Thoughts
As I wrap up this dive into Terraform and its capabilities, it becomes hard to imagine why any developer wouldn't be using a tool like unto it! Infrastructure as code is a gamechanger for the DevOps world, enabling fast, consistent, and reliable provision of the resources behind the scenes making our projects work. As I move onto larger-scale, production-level projects, I will definitely be looking to integrate Terraform into my workflows.

### References
1. https://developer.hashicorp.com/terraform/intro
2. https://www.varonis.com/blog/what-is-terraform
3. https://developer.hashicorp.com/terraform/tutorials/docker-get-started/infrastructure-as-code
