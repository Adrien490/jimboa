// types/server-action.ts
import { z } from "zod";

export enum ActionStatus {
	SUCCESS = "success",
	ERROR = "error",
	UNAUTHORIZED = "unauthorized",
	VALIDATION_ERROR = "validation_error",
	NOT_FOUND = "not_found",
	CONFLICT = "conflict",
	FORBIDDEN = "forbidden",
	INITIAL = "initial",
}

export type ValidationErrors<T> = {
	[K in keyof T]?: string[];
};

export type ServerResponse<TData> = {
	status: ActionStatus;
	message: string;
	data?: TData;
};

export type ActionState<
	TData,
	TSchema extends z.ZodType,
> = ServerResponse<TData> & {
	validationErrors?: ValidationErrors<z.infer<TSchema>>;
	formData?: z.infer<TSchema>;
	inputs?: z.infer<TSchema>;
};

export type ServerAction<TData, TSchema extends z.ZodType> = (
	state: ActionState<TData, TSchema> | undefined,
	formData: FormData
) => Promise<ActionState<TData, TSchema>>;

export function createSuccessResponse<TData, TSchema extends z.ZodType>(
	data: TData,
	message: string,
	inputs?: z.infer<TSchema>
): ActionState<TData, TSchema> {
	return {
		status: ActionStatus.SUCCESS,
		message,
		data,
		inputs,
	};
}

export function createErrorResponse<TData, TSchema extends z.ZodType>(
	status: ActionStatus,
	message: string,
	inputs?: z.infer<TSchema>
): ActionState<TData, TSchema> {
	return {
		status,
		message,
		inputs,
	};
}

export function createValidationErrorResponse<TData, TSchema extends z.ZodType>(
	validationErrors: ValidationErrors<z.infer<TSchema>>,
	message: string,
	inputs?: z.infer<TSchema>
): ActionState<TData, TSchema> {
	return {
		status: ActionStatus.VALIDATION_ERROR,
		message,
		validationErrors,
		inputs,
	};
}
