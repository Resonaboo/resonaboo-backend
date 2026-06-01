using Microsoft.AspNetCore.Mvc;

namespace Audityboo.Controllers;

[ApiController]
[Route("/")]
public class HomeController : Controller
{
    /// <summary>
    /// Login user
    /// </summary>
    /// <remarks>
    /// Get user info from discord
    /// </remarks>
    [HttpGet]
    [ProducesResponseType(typeof(String), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(String), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAuthorize()
    {
        //return StatusCode(StatusCodes.Status500InternalServerError, error);
        return Ok("Hello, world!");
    }
}