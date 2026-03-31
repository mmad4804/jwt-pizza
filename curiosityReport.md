# Curiosity Report: Exploring Terraform
I first heard about Terraform a year ago among some of my classmates who were using it. No one ever fully explained what it was though, and I have to admit that my concept of it was very nebulous at best. When it was again mentioned in this course as an alternative to AWS CloudFormation, I decided it would be worth investigating. I hope to also compare and contrast what it has to offer with other similar tools out there.

## Overview of Terraform
Terraform is an Infrastructure-As-Code tool, meaning that it enables developers to write human-readable files that automate all the infrastructure configuration and resource deployment needed for a software application/project. One of its biggest selling points is that it iths platform agnostic, integrating easily with any number of existing services you may be using. I also appreciate how Terraform works by a declarative model: you define the desired final state of your resources, and it offers the plan of how to build that infrastructure. It essentially handles the underlying logic for you.

Some of the benefits of using Terraform include:
- *Collaboration*: working with a team to define and update these resources becomes much easier when there's a shared file that can be versioned and tracked, as opposed to manual configurations on individual consoles.
- *Speed*: toil is greatly reduced when a whole infrastructure can be spun up by running a script. Not to mention, bouncing back from failures/disasters becomes much simpler and reduces errors.
- 

While many of my class projects have worked primarily within Amazon's cloud, I hope to expand my experience with other providers as well, and I can see how Terraform could play a large part in supporting multi-cloud services. 

### References
https://developer.hashicorp.com/terraform/intro
https://www.varonis.com/blog/what-is-terraform
