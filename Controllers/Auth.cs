using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[ApiController]
[Route("auth")]
[Tags("Authentication & Users")]
[ApiExplorerSettings(GroupName = "internal")]
public class Auth : Controller
{
    /// <summary>
    /// Registers a new user into the system.
    /// </summary>
    /// <remarks>
    /// Registration endpoint for the application.
    /// </remarks>
    /// <response code="200">Returns a success message confirming the account creation.</response>
    /// <response code="400">If the request contains invalid data or mandatory headers are missing.</response>
    /// <response code="409">If the provided email is already registered in the database.</response>
    [HttpGet("sign-up")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status409Conflict)]
    public IActionResult SignUp()
    {
        return Ok("Test");
    }
    
    /// <summary>
    /// Authenticates a user into the application.
    /// </summary>
    /// <remarks>
    /// Login endpoint for the application.
    /// </remarks>
    /// <response code="200">Authentication successful. The 'session-id' cookie has been injected into the response.</response>
    /// <response code="401">Invalid or incorrect credentials.</response>
    [HttpPost("sign-in")] // Changed to POST as authentication should securely transmit data
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
    public IActionResult SignIn()
    {
        // Simulated implementation of cookie insertion validated by your GlobalMiddleware
        Response.Cookies.Append("session-id", "generated-token-here", new CookieOptions 
        { 
            HttpOnly = true, 
            Secure = true 
        });
        
        return Ok("Successfully authenticated");
    }
    
    /// <summary>
    /// Terminates the current user session.
    /// </summary>
    /// <remarks>
    /// Logout endpoint for the application.
    /// </remarks>
    /// <response code="200">Session successfully terminated and local cookie removed.</response>
    [HttpPost("sign-out")] // Changed to POST based on REST best practices for state modification
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult SignOut()
    {
        Response.Cookies.Delete("session-id");
        return Ok("Session closed");
    }
}