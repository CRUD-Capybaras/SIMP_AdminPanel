using System.Data.Common;
using Microsoft.EntityFrameworkCore;

namespace LABAPP.EntityFrameworkCore
{
    public static class LABAPPDbContextConfigurer
    {
        public static void Configure(DbContextOptionsBuilder<LABAPPDbContext> builder, string connectionString)
        {
            builder.UseSqlite(connectionString);
        }

        public static void Configure(DbContextOptionsBuilder<LABAPPDbContext> builder, DbConnection connection)
        {
            builder.UseSqlite(connection);
        }
    }
}
