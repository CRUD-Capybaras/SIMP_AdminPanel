using System.Threading.Tasks;
using LABAPP.Models.TokenAuth;
using LABAPP.Web.Controllers;
using Shouldly;
using Xunit;

namespace LABAPP.Web.Tests.Controllers
{
    public class HomeController_Tests: LABAPPWebTestBase
    {
        [Fact]
        public async Task Index_Test()
        {
            await AuthenticateAsync(null, new AuthenticateModel
            {
                UserNameOrEmailAddress = "admin",
                Password = "123qwe"
            });

            //Act
            var response = await GetResponseAsStringAsync(
                GetUrl<HomeController>(nameof(HomeController.Index))
            );

            //Assert
            response.ShouldNotBeNullOrEmpty();
        }
    }
}