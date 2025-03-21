
import React, { useState } from "react";
import { SendReviewRequestFormProps } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SendReviewRequestForm: React.FC<SendReviewRequestFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    customerId: 0,
    customerName: "",
    customerEmail: "",
    templateId: "1"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerEmail) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        customerId: formData.customerId || Math.floor(Math.random() * 1000) // Placeholder for demo
      });
      // Reset form
      setFormData({
        customerId: 0,
        customerName: "",
        customerEmail: "",
        templateId: "1"
      });
    } catch (error) {
      console.error("Error sending review request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Enter customer name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerEmail">Customer Email</Label>
          <Input
            id="customerEmail"
            name="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="Enter customer email"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="templateId">Email Template</Label>
        <Select
          value={formData.templateId}
          onValueChange={(value) => handleSelectChange("templateId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Standard Review Request</SelectItem>
            <SelectItem value="2">Post-Service Review Request</SelectItem>
            <SelectItem value="3">Follow-up Review Request</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={
            isSubmitting || !formData.customerName || !formData.customerEmail
          }
          className="w-full md:w-auto"
        >
          {isSubmitting ? "Sending..." : "Send Review Request"}
        </Button>
      </div>
    </form>
  );
};

export default SendReviewRequestForm;
