using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[ApiController]
[Route("notify")]
public class Notify : Controller
{
    /// <summary>
    /// Notify route
    /// </summary>
    /// <remarks>
    /// Test route
    /// </remarks>
    [HttpGet("index")]
    [ProducesResponseType(typeof(String), StatusCodes.Status200OK)]
    public IActionResult Index()
    {
        return Ok("Notify");
    }
}