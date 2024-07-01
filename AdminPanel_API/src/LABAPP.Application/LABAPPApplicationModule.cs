using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using LABAPP.Authorization;

namespace LABAPP
{
    [DependsOn(
        typeof(LABAPPCoreModule), 
        typeof(AbpAutoMapperModule))]
    public class LABAPPApplicationModule : AbpModule
    {
        public override void PreInitialize()
        {
            Configuration.Authorization.Providers.Add<LABAPPAuthorizationProvider>();
        }

        public override void Initialize()
        {
            var thisAssembly = typeof(LABAPPApplicationModule).GetAssembly();

            IocManager.RegisterAssemblyByConvention(thisAssembly);

            Configuration.Modules.AbpAutoMapper().Configurators.Add(
                // Scan the assembly for classes which inherit from AutoMapper.Profile
                cfg => cfg.AddMaps(thisAssembly)
            );
        }
    }
}
