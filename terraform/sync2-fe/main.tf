variable "project" {
  default = "explore"
}

module "sync2-domains" {
  source                  = "git@github.com:vechain/terraform_infrastructure_modules.git//route53?ref=v.1.0.44"
  public_zone_name        = "${local.env.environment}.${local.env.project}.vechain.org"
  domain_name             = "${local.env.project}.vechain.org"
  project                 = local.env.project
  env                     = local.env.environment
  public_zone_record_name = "${local.env.environment}.${local.env.project}"
  records                 = [
    "${local.env.environment}.${local.env.project}.vechain.org"
  ]
  subdomain_type          = "CNAME"
  create_cert             = true
}

module "sync2-frontend" {
  source        = "git@github.com:vechain/terraform_infrastructure_modules.git//s3-cloudfront-hosting?ref=v.1.0.44"
  env           = local.env.environment
  origin_id     = "${module.sync2-domains.public_zone_name}_origin_id"
  bucket_prefix = "${local.env.environment}-${local.env.project}-sync2"
  domain_name   = module.sync2-domains.public_zone_name
  domain_zone   = module.sync2-domains.public_zone_id
  project       = local.env.project
}
