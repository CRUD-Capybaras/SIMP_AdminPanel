using LABAPP.Debugging;

namespace LABAPP
{
    public class LABAPPConsts
    {
        public const string LocalizationSourceName = "LABAPP";

        public const string ConnectionStringName = "Default";

        public const bool MultiTenancyEnabled = true;


        /// <summary>
        /// Default pass phrase for SimpleStringCipher decrypt/encrypt operations
        /// </summary>
        public static readonly string DefaultPassPhrase =
            DebugHelper.IsDebug ? "gsKxGZ012HLL3MI5" : "beb2acd376cd4a68bb7c8946543e9a7a";
    }
}
