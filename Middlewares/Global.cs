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
        var endpoint = context.GetEndpoint();
        if (endpoint == null)
        {
            await _next(context);
            return;
        }
        
        String userAgent = context.Request.Headers.UserAgent.ToString();
        String language = context.Request.Headers.AcceptLanguage.ToString();
        
        bool isDocApiRoute =
            context.Request.Path.StartsWithSegments("/openapi", out var _) ||
            context.Request.Path.StartsWithSegments("/scalar", out var _) ||
            context.Request.Path.StartsWithSegments("/swagger", out var _);

        bool isPublicRoute =
            context.Request.Path.StartsWithSegments("/status", out var _) ||
            context.Request.Path.StartsWithSegments("/auth", out var _);

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