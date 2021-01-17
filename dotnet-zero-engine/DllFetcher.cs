using DotnetZero.Engine.Dto;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;


namespace DotnetZero.Engine
{
    public static class DllFetcher
    {
        private static readonly Dictionary<string, byte[]> _cache = new Dictionary<string, byte[]>();
        private static readonly HttpClient _httpClient = new HttpClient();

        public static async Task<byte[]> GetDllBytes(ConfigDto config, string name)
        {
            if (_cache.ContainsKey(name))
            {
                return _cache[name];
            }
            try
            {
                var response = await _httpClient.GetByteArrayAsync($"{config.BaseUrl}/_framework/_bin/{name}");
                _cache[name] = response;
                return response;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
                return null;
            }
        }
    }
}