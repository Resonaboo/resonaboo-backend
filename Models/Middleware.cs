namespace Audityboo.Models;

public class MiddlewareModule
{
    public readonly RequestDelegate _next;
    
    public MiddlewareModule(RequestDelegate next)
    {
        _next = next;
    }
}