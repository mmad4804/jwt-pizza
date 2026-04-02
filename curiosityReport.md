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

## How It Works
According to Terraform's website, "plugins called providers let Terraform interact with cloud platforms and other services via their application programming interfaces (APIs)" <sup>3</sup>. You can even write your own providers that integrate with Terraform! 

## Tutorial
To get a feel for how Terraform works, I followed one of the tutorials on their website (https://developer.hashicorp.com/terraform/tutorials/docker-get-started/infrastructure-as-code) for building a simple docker infrastructure using Terraform.

One of the first steps was to install Terraform on my local machine, which I did using Chocolatey:
` choco install terraform `
<img width="1918" height="785" alt="image" src="https://github.com/user-attachments/assets/d419865b-f6df-4d01-bd2d-32477530b1b6" />



### References
1. https://developer.hashicorp.com/terraform/intro
2. https://www.varonis.com/blog/what-is-terraform
3. https://developer.hashicorp.com/terraform/tutorials/docker-get-started/infrastructure-as-code
