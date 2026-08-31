using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[ApiController]
[Route("auth")]
public class Auth : Controller
{
    /// <summary>
    /// Register new user
    /// </summary>
    /// <remarks>
    /// Create a new account
    /// </remarks>
    [HttpGet("sign-up")]
    public IActionResult SignUp()
    {
        return Ok("Teste");
    }
    /*
    [HttpGet("sign-in")]
    public IActionResult SignIn()
    {
        
    }
    
    [HttpGet("sign-out")]
    public IActionResult SignOut()
    {
        return View();
    }
    */
}