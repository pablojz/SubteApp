using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace SubteApp.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ForecastGTFSController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<ForecastGTFSController> _logger;

        public ForecastGTFSController(ILogger<ForecastGTFSController> logger)
        {
            _logger = logger;
        }


        [HttpGet]
        public async Task<List<EntityF>> Get()        
        {            
            ForecastGTFS forecastGTFS;
            List<EntityF> entityF;

            using (var httpClient = new HttpClient())
            {
                using (var response = await httpClient.GetAsync("https://apitransporte.buenosaires.gob.ar/subtes/forecastGTFS?client_id=1&client_secret=1"))

                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    //var serviceAlerts = ServiceAlerts.FromJson(apiResponse);
                    forecastGTFS = ForecastGTFS.FromJson(apiResponse);
                    entityF = forecastGTFS.EntityF;

                    int count = forecastGTFS.EntityF.Count();
                }
            }
            return entityF;
        }
    }
}