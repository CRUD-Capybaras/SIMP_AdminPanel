using Abp.Application.Services;
using LABAPP.MultiTenancy.Dto;

namespace LABAPP.MultiTenancy
{
    public interface ITenantAppService : IAsyncCrudAppService<TenantDto, int, PagedTenantResultRequestDto, CreateTenantDto, TenantDto>
    {
    }
}

