import { z } from "zod";
import { startOfDay } from "date-fns";
import { PropertySizeEnum, ServiceTypeEnum } from "@/types/booking";

const baseFields = {
  service: z.nativeEnum(ServiceTypeEnum),
  propertySize: z.nativeEnum(PropertySizeEnum),
  date: z.coerce
    .date()
    .refine((d) => !Number.isNaN(d.getTime()), { message: "Choose a date" }),
  time: z.string().min(1, "Choose a time slot"),
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone required"),
  postcode: z.string().min(1, "Enter the postcode for the service location"),
  address: z.string().min(8, "Please enter a full address"),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
};

function futureDateRefine<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data, ctx) => {
    const d = (data as { date: Date }).date;
    if (d && startOfDay(d) < startOfDay(new Date())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date must be today or in the future",
        path: ["date"],
      });
    }
  });
}

export const bookingFormSchema = futureDateRefine(z.object(baseFields));

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const bookingApiSchema = futureDateRefine(z.object(baseFields));

export type BookingApiValues = z.infer<typeof bookingApiSchema>;
