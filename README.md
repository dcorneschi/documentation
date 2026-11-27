# DevOps Wiki

90 hands-on articles and cheatsheets on AWS, Kubernetes, Terraform, Docker, Ansible, Linux and terminal tools.

[AWS](#aws) (19) · [Kubernetes](#kubernetes) (18) · [Helm](#helm) (5) · [Terraform](#terraform) (11) · [Docker](#docker) (10) · [Ansible](#ansible) (4) · [Linux & Bash](#linux--bash) (14) · [cloud-init](#cloud-init) (3) · [Terminal & macOS](#terminal--macos) (6)

## AWS

- [Installing the AWS CLI v2 on Linux, macOS and Docker](aws-cli-install/index.md)
- [AWS Global Accelerator: Static Anycast IPs and Multi-Region Failover](aws-global-accelerator-guide/index.md)
- [AWS Network Firewall: Rules, Routing, Logging and Cost](aws-network-firewall-guide/index.md)
- [Auto Scaling Group Capacity: Minimum, Desired and Maximum](aws-asg-min-desired-max-capacity/index.md)
- [Amazon EC2 Billing and Purchasing Options: On-Demand, Savings Plans, Reserved Instances, Spot, Dedicated and Capacity Reservations](aws-ec2-billing-purchasing-options/index.md)
- [AWS Route 53 Cheatsheet](aws-route53-cheatsheet/index.md)
- [EC2 Placement Groups: Cluster, Partition, Spread and Precision Time](aws-ec2-placement-groups-guide/index.md)
- [Connecting to EC2: SSH vs EC2 Instance Connect vs Instance Connect Endpoint vs Session Manager vs Serial Console](aws-ec2-connection-methods-compared/index.md)
- [AWS Certificate Manager (ACM): Free TLS Certificates for Your AWS Services](aws-certificate-manager-guide/index.md)
- [AWS Backup: Plans, Vaults, Copies, Vault Lock and Restore Testing](aws-backup-guide/index.md)
- [S3 Object Lock: Governance vs Compliance Mode, Legal Holds and Event Holds](aws-s3-object-lock-modes-guide/index.md)
- [S3 Lifecycle Policies: Transitions, Expiration, Versions and the Rules That Surprise You](aws-s3-lifecycle-policies-guide/index.md)
- [AWS Storage Gateway Cheatsheet](aws-storage-gateway-cheatsheet/index.md)
- [Amazon EC2 Auto Scaling Groups: Capacity, Scaling Policies, Lifecycle Hooks and Instance Refresh](aws-auto-scaling-groups-guide/index.md)
- [AWS S3 Cheatsheet](aws-s3-cheatsheet/index.md)
- [AWS S3 Sync: How It Decides What to Copy, Filters, Delete and the Download Trap](aws-s3-sync-guide/index.md)
- [AWS EBS Cheatsheet](aws-ebs-cheatsheet/index.md)
- [AWS IAM Concepts Guide](aws-iam-concepts-guide/index.md)
- [AWS Lightsail Cheatsheet](aws-lightsail/index.md)

## Kubernetes

- [CrashLoopBackOff Explained: Backoff, Exit Codes and How to Debug It](kubernetes-crashloopbackoff-explained/index.md)
- [Kubernetes Rolling Updates: What Actually Happens, Measured](kubernetes-rolling-updates/index.md)
- [Kubernetes Troubleshooting: 10 Failures, Reproduced and Fixed](kubernetes-troubleshooting-techniques/index.md)
- [How to Create Kubernetes YAML Manifests Quickly](kubernetes-yaml-manifests-quickly/index.md)
- [Getting Started with Argo CD: Deploy Metrics Server from a Helm Chart](argocd-getting-started/index.md)
- [Argo CD Cheatsheet](argocd-cheatsheet/index.md)
- [Kubernetes Architecture on a kubeadm Cluster: What Each Component Does](kubernetes-architecture-components/index.md)
- [kubectl describe vs kubectl logs: What Each One Shows and How Long It's Kept](kubectl-describe-vs-logs/index.md)
- [Argo CD Rollback: How It Works and Why the App Shows OutOfSync](argocd-rollback-out-of-sync/index.md)
- [Kubernetes CPU and Memory Requests and Limits: What Each Value Really Does](kubernetes-cpu-memory-requests-limits/index.md)
- [Kubernetes Cluster Autoscaler: Scale-Up, Scale-Down, Expanders and EKS Setup](kubernetes-cluster-autoscaler-guide/index.md)
- [Kubernetes Vertical Pod Autoscaler (VPA)](kubernetes-vpa-guide/index.md)
- [Kubernetes emptyDir Volumes](kubernetes-emptydir-volumes/index.md)
- [k9s Cheatsheet](k9s-cheatsheet/index.md)
- [Kubernetes Health Checks: Liveness, Readiness, and Startup Probes](kubernetes-health-checks-probes/index.md)
- [Kubernetes Pod Lifecycle Management](kubernetes-pod-lifecycle-management/index.md)
- [Kubernetes Node Selectors: nodeSelector, Node Affinity, Taints and nodeName](kubernetes-node-selectors/index.md)
- [HAProxy Ingress Controller on EKS with a Network Load Balancer](haproxy-ingress-eks/index.md)

## Helm

- [Helm vs Argo CD vs Kustomize vs Flux: Which Tool Does What](helm-argocd-kustomize-flux-compared/index.md)
- [Kustomize vs Helm: Overlays, Charts, Merge Rules and Using Both](kustomize-vs-helm/index.md)
- [What's New in Helm 4](helm-4-whats-new/index.md)
- [Comparing Helm Chart Versions Before an Upgrade](helm-compare-chart-versions/index.md)
- [Helm Cheatsheet](helm/index.md)

## Terraform

- [Terraform: How to Find a Resource's .arn and .id](terraform-find-arn-and-id/index.md)
- [Terraform Variables: Declaration, Validation, Precedence and Sensitive Values](terraform-variables-guide/index.md)
- [Terraform Provisioners Guide](terraform-provisioners-guide/index.md)
- [What's New in Terraform: Every Release Since 1.0](terraform-whats-new/index.md)
- [Terraform S3 Backend: dynamodb_table Is Deprecated, Use use_lockfile](terraform-dynamodb-table-deprecated-use-lockfile/index.md)
- [Terraform Cheatsheet](terraform-cheatsheet/index.md)
- [Migrating State Off HCP Terraform (Terraform Cloud)](terraform-migrate-state-off-terraform-cloud/index.md)
- [terraform init -upgrade and Version Constraints](terraform-init-upgrade-and-constraints/index.md)
- [terraform get -update vs terraform init -upgrade](terraform-get-update-vs-init-upgrade/index.md)
- [terraform.tfstate vs .terraform/terraform.tfstate](terraform-tfstate-vs-terraform-directory-state/index.md)
- [Terraform Lock File Checksums: zh and h1 Hashes](terraform-lock-file-checksums/index.md)

## Docker

- [Docker overlay2 Storage: How Image and Container Layers Live on Disk](docker-overlay2-storage/index.md)
- [Listing Image Tags in Docker Hub and Other Container Registries](container-registry-list-tags/index.md)
- [Docker Compose 2.x vs 5.x](docker-compose-2x-vs-5x-guide/index.md)
- [Docker Restart Policies](docker-restart-policies/index.md)
- [Defining Variables in Docker Compose: Interpolation, environment, env_file and .env](docker-compose-variables-env/index.md)
- [Docker Cheatsheet](docker-cheatsheet/index.md)
- [How Docker Images Are Built: Layers, Cache and the Container on Top](docker-image-layers/index.md)
- [How docker pull Works: Technical Details](docker-pull-technical-details-guide/index.md)
- [Docker Compose Cheatsheet](docker-compose/index.md)
- [Why Docker Compose Needs build.pull and pull_policy Set to build](docker-compose-build-pull-policy/index.md)

## Ansible

- [Ansible Ad-Hoc Commands Cheatsheet](ansible-adhoc-cheatsheet/index.md)
- [Ansible Cheatsheet](ansible-cheatsheet/index.md)
- [Ansible Inventory Guide](ansible-inventory-guide/index.md)
- [Ansible and the Target's Python: Versions by OS](ansible-python-interpreter/index.md)

## Linux & Bash

- [Escaping Special Characters in Bash](bash-escaping-special-characters/index.md)
- [fssh: Pick an SSH Host from ~/.ssh/config with fzf](fzf-ssh-host-picker/index.md)
- [Bash Aliases and Functions](bash-aliases-functions/index.md)
- [Cron Cheatsheet](cron-cheatsheet/index.md)
- [ProxMenux Monitor: A Web Dashboard for Proxmox VE](proxmenux-monitor/index.md)
- [apt vs apt-get: Differences and When to Use Each](apt-vs-apt-get/index.md)
- [Linux User Administration Cheatsheet](user-administration/index.md)
- [iotop Cheatsheet](iotop-cheatsheet/index.md)
- [Understanding /proc/meminfo](linux-proc-meminfo-explained/index.md)
- [Linux Swap Usage: When Processes Aren't the Culprit](linux-swap-shm-segments/index.md)
- [Linux Memory: RSS, VSZ, and Why RSS Alone Is Misleading](linux-memory-rss-vsz/index.md)
- [Linux Processes and Signals Cheatsheet](ps/index.md)
- [Installing MediaWiki on Ubuntu](mediawiki-installation-ubuntu/index.md)
- [KVM / virsh Cheatsheet](kvm/index.md)

## cloud-init

- [cloud-init: bootcmd vs runcmd](cloud-init-bootcmd-vs-runcmd/index.md)
- [cloud-init Heredocs and Logging](cloud-init-heredoc-logging-guide/index.md)
- [Why tee Output Goes Missing in cloud-init](cloud-init-tee-output-missing/index.md)

## Terminal & macOS

- [Copying Nintendo Switch Screenshots to a Mac over USB](switch-screenshots-mac/index.md)
- [Ghostty Cheatsheet](ghostty-cheatsheet/index.md)
- [Alfred 5 for DevOps: Launcher, Powerpack and Workflows](alfred-5/index.md)
- [iTerm2 vs kitty vs Alacritty vs Ghostty vs Otty vs cmux](macos-terminal-emulators-compared/index.md)
- [fzf Cheatsheet](fzf/index.md)
- [tmux Cheatsheet](tmux/index.md)
