import type { FastifyTypedInstance } from "#types";
import { StatusCodes } from "http-status-codes";
import { Exception } from "#utils";
import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";
//import { JsonWebTokenError } from "jsonwebtoken";

export function exceptions(app: FastifyTypedInstance) {
  app.addHook("onError", async (req, res, error) => {
    if (error instanceof Exception) {
      if (error.statusCode === 401)
        return res
          .status(error.statusCode)
          .clearCookie("auth-token", {
            path: "/",
            sameSite: "lax",
          })
          .clearCookie("user-info", {
            path: "/",
            sameSite: "lax",
          })
          .send({ message: error.message });
      return res.status(error.statusCode).send({ message: error.message });
    }
/*
    if (error instanceof JsonWebTokenError) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: "Jwt", message: error.message });
    }
*/
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof DatabaseError) {
        const dbErr = error.cause as unknown as {
          code?: string;
          detail?: string;
          constraint?: string;
        };
        const sqlCode = dbErr.code;

        const mapping: Record<
          string,
          { type: string; message: string; status: number }
        > = {
          // unique_violation
          "23505": {
            type: "UniqueViolation",
            message:
              "Unique constraint violated: a record with the same value already exists.",
            status: StatusCodes.CONFLICT,
          },
          // foreign_key_violation
          "23503": {
            type: "ForeignKeyViolation",
            message:
              "Foreign key constraint violated: related record not found.",
            status: StatusCodes.BAD_REQUEST,
          },
          // not_null_violation
          "23502": {
            type: "NotNullViolation",
            message: "Missing required value: a required field was null.",
            status: StatusCodes.BAD_REQUEST,
          },
          // invalid_text_representation
          "22P02": {
            type: "InvalidInput",
            message: "Invalid input syntax for the expected data type.",
            status: StatusCodes.BAD_REQUEST,
          },
        };

        const meta =
          sqlCode && mapping[sqlCode]
            ? mapping[sqlCode]
            : {
                type: "DatabaseError",
                message: "An unexpected database error occurred.",
                status: StatusCodes.INTERNAL_SERVER_ERROR,
              };

        const payload: Record<string, unknown> = {
          error: meta.type,
          message: meta.message,
        };

        if (dbErr.detail) payload.detail = dbErr.detail;
        if ((dbErr as any).constraint)
          payload.constraint = (dbErr as any).constraint;

        return res.status(meta.status).send(payload);
      }

      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ error: "QueryError", message: "A query error occurred." });
    }
  });
}
