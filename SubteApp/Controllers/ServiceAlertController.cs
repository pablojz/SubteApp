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
    public class ServiceAlertController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<ServiceAlertController> _logger;

        public ServiceAlertController(ILogger<ServiceAlertController> logger)
        {
            _logger = logger;
        }


        [HttpGet]
        public async Task<List<Entity>> Get()        
        {            
            ServiceAlerts serviceAlerts;
            List<Entity> entity;

            using (var httpClient = new HttpClient())
            {
                using (var response = await httpClient.GetAsync("https://apitransporte.buenosaires.gob.ar/subtes/serviceAlerts?json=1&client_id=1&client_secret=1"))

                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    //var serviceAlerts = ServiceAlerts.FromJson(apiResponse);
                    serviceAlerts = ServiceAlerts.FromJson(apiResponse);
                    entity = serviceAlerts.Entity;

                    int count = serviceAlerts.Entity.Count();
                }
            }
            return entity;
        }
    }
}