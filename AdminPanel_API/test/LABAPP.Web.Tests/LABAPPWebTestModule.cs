using Abp.AspNetCore;
using Abp.AspNetCore.TestBase;
using Abp.Modules;
using Abp.Reflection.Extensions;
using LABAPP.EntityFrameworkCore;
using LABAPP.Web.Startup;
using Microsoft.AspNetCore.Mvc.ApplicationParts;

namespace LABAPP.Web.Tests
{
    [DependsOn(
        typeof(LABAPPWebMvcModule),
        typeof(AbpAspNetCoreTestBaseModule)
    )]
    public class LABAPPWebTestModule : AbpModule
    {
        public LABAPPWebTestModule(LABAPPEntityFrameworkModule abpProjectNameEntityFrameworkModule)
        {
            abpProjectNameEntityFrameworkModule.SkipDbContextRegistration = true;
        } 
        
        public override void PreInitialize()
        {
            Configuration.UnitOfWork.IsTransactional = false; //EF Core InMemory DB does not support transactions.
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(LABAPPWebTestModule).GetAssembly());
        }
        
        public override void PostInitialize()
        {
            IocManager.Resolve<ApplicationPartManager>()
                .AddApplicationPartsIfNotAddedBefore(typeof(LABAPPWebMvcModule).Assembly);
        }
    }
}