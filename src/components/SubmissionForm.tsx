"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { FiUpload, FiTrash, FiPlus } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { uploadFiles, submitFormData } from "@/utils/apiRoutes";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.date().refine((date) => {
    const age = new Date().getFullYear() - date.getFullYear();
    return age >= 18;
  }, "You must be at least 18 years old"),
  residentialStreet1: z.string().min(1, "Residential street is required"),
  residentialStreet2: z.string().optional(),
  sameAsResidential: z.boolean(),
  permanentStreet1: z.string().optional(),
  permanentStreet2: z.string().optional(),
  documents: z
    .array(
      z.object({
        fileName: z.string().min(1, "File name is required"),
        fileType: z.enum(["image", "pdf"]),
        file: z.any(),
      })
    )
    .min(2, "At least two documents are required"),
});

interface RequiredLabelProps {
  children: React.ReactNode;
}

const RequiredLabel: React.FC<RequiredLabelProps> = ({ children }) => (
  <FormLabel>
    {children}
    <span className="text-red-500 ml-1">*</span>
  </FormLabel>
);
export default function SubmissionForm() {
  const [sameAsResidential, setSameAsResidential] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateOfBirth: new Date(),
      sameAsResidential: false,
      documents: [
        { fileName: "", fileType: "image", file: null },
        { fileName: "", fileType: "image", file: null },
      ],
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        residentialStreet1: data.residentialStreet1,
        residentialStreet2: data.residentialStreet2,
        sameAsResidential: data.sameAsResidential,
        permanentStreet1: data.permanentStreet1,
        permanentStreet2: data.permanentStreet2,
      }));
  
      for (const doc of data.documents) {
        if (doc.file) {
          formData.append("files", doc.file);
        }
      }
  
      await uploadFiles(formData);
      await submitFormData(data);
  
      alert("Form submitted successfully!");
    } catch (error) {
      console.error(error);
      alert("Form submission failed. Please try again.");
    }
  };

  const addDocument = () => {
    const documents = form.getValues("documents");
    form.setValue("documents", [
      ...documents,
      { fileName: "", fileType: "image", file: null },
    ]);
  };

  const removeDocument = (index: number) => {
    const documents = form.getValues("documents");
    form.setValue(
      "documents",
      documents.filter((_, i) => i !== index)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>First Name</RequiredLabel>
                <FormControl>
                  <Input placeholder="Enter your first name here.." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>Last Name</RequiredLabel>
                <FormControl>
                  <Input placeholder="Enter your last name here.." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>Email</RequiredLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="ex: myname@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>Date of Birth</RequiredLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Date of Birth</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
                <p className="text-xs font-normal">(Min. age should be 18 years)</p>
              </FormItem>
            )}
          />
        </div>

        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="residentialStreet1"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>Residential Address (Street 1)</RequiredLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="residentialStreet2"
            render={({ field }) => (
              <FormItem>
                <RequiredLabel>Residential Address (Street 2)</RequiredLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sameAsResidential"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    setSameAsResidential(checked as boolean);
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Same as Residential Address</FormLabel>
                <FormDescription>
                  Use the same address for permanent address
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {!sameAsResidential && (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="permanentStreet1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permanent Address (Street 1)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permanentStreet2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permanent Address (Street 2)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upload Documents</h3>
          {form.watch("documents").map((_, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name={`documents.${index}.fileName`}
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>File Name</RequiredLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name={`documents.${index}.fileType`}
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Type of File</RequiredLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full p-2 border rounded"
                        >
                          <option value="image">Image</option>
                          <option value="pdf">PDF</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name={`documents.${index}.file`}
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>File Upload</RequiredLabel>
                      <FormControl>
                        <div className="relative flex items-center">
                          <input
                            type="file"
                            accept={
                              field.value?.fileType === "image"
                                ? "image/*"
                                : "application/pdf"
                            }
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                field.onChange(e.target.files[0]);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <div className="w-full p-2 border rounded flex items-center justify-between">
                            <span>{field.value?.name || "No file chosen"}</span>
                            <FiUpload className="text-gray-500" />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2 flex items-center">
                {index === 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-12 h-12 flex items-center justify-center bg-black text-white rounded"
                    onClick={addDocument}
                  >
                    <FiPlus className="w-6 h-6" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-12 h-12 flex items-center justify-center bg-gray-100 text-black rounded"
                    onClick={() => removeDocument(index)}
                  >
                    <FiTrash className="w-6 h-6" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            className="bg-gray-800 text-white font-light text-lg rounded-md px-10 py-5"
          >
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}