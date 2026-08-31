using Microsoft.AspNetCore.Http;
using Modules;

namespace Middlewares;

public class GlobalMiddleware : MiddlewareModule
{
    public GlobalMiddleware(RequestDelegate next) : base(next)
    {
    }

    public async Task InvokeAsync(HttpContext context)
    {
        String userAgent = context.Request.Headers.UserAgent.ToString();
        String language = context.Request.Headers.AcceptLanguage.ToString();
        
        bool isDocApiRoute =
            context.Request.Path.StartsWithSegments("/openapi") ||
            context.Request.Path.StartsWithSegments("/swagger");

        bool isPublicRoute =
            context.Request.Path.StartsWithSegments("/status") ||
            context.Request.Path.StartsWithSegments("/auth");

        if ((string.IsNullOrEmpty(userAgent) || string.IsNullOrEmpty(language)) && !isDocApiRoute)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsync("Missing required headers: User-Agent or Accept-Language");
            return;
        }

        if (!isPublicRoute && !context.Request.Cookies.ContainsKey("session-id") && !isDocApiRoute)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("Missing credentials");
            return;
        }

        await _next(context);
    }
}