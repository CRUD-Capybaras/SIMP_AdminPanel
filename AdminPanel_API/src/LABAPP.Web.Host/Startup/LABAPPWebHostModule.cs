using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Abp.Modules;
using Abp.Reflection.Extensions;
using LABAPP.Configuration;

namespace LABAPP.Web.Host.Startup
{
    [DependsOn(
       typeof(LABAPPWebCoreModule))]
    public class LABAPPWebHostModule: AbpModule
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfigurationRoot _appConfiguration;

        public LABAPPWebHostModule(IWebHostEnvironment env)
        {
            _env = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(LABAPPWebHostModule).GetAssembly());
        }
    }
}
