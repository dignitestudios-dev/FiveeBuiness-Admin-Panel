import { useState } from "react";
import { Eye, EyeOff, Lock, CheckCircle, Shield } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import Popup from "../components/ui/Popup";
import { useForm } from "react-hook-form";
import { SECURITY_CONFIG } from "../config/constants";
import { useAuth } from "../contexts/AuthContext";
import { handleError } from "../utils/helpers";

const ChangePassword = () => {
  const { updatePassword } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();
  const watchNewPassword = watch("newPassword");

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < SECURITY_CONFIG.passwordMinLength) {
      errors.push(`At least ${SECURITY_CONFIG.passwordMinLength} characters`);
    }

    if (SECURITY_CONFIG.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    }

    if (SECURITY_CONFIG.passwordRequireLowercase && !/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    }

    if (SECURITY_CONFIG.passwordRequireNumbers && !/\d/.test(password)) {
      errors.push("One number");
    }

    if (
      SECURITY_CONFIG.passwordRequireSpecialChars &&
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errors.push("One special character");
    }

    return errors.length === 0
      ? true
      : `Password must contain: ${errors.join(", ")}`;
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const payload = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };
      const response = await updatePassword(payload);

      if (response.success) {
        setIsSuccess(true);
        reset();

        // Hide success message after 5 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 5000);
      } else {
        handleError(response.error || "Error changing password");
        console.error("Error changing password:", response.error);
      }
    } catch (error) {
      handleError(error.message || "Error changing password");
      console.error("Error changing password:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-500/30 dark:bg-primary-900/10 mb-4">
          <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Change Password
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Update your password to keep your account secure
        </p>
      </div>

      {/* Success Message */}
      {isSuccess && (
        <Popup
          open={isSuccess}
          onClose={() => setIsSuccess(false)}
          type="success"
          title="Password Changed"
          message="Your password has been updated successfully!"
          confirmText="OK"
          showCloseButton={false}
          onConfirm={() => setIsSuccess(false)}
        />
      )}

      {/* Change Password Form */}
      <Card>
        <Card.Header>
          <Card.Title>Update Your Password</Card.Title>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Password */}
            <Input
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("currentPassword", {
                required: "Current password is required",
              })}
              error={errors.currentPassword?.message}
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            {/* New Password */}
            <Input
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("newPassword", {
                required: "New password is required",
                validate: validatePassword,
              })}
              error={errors.newPassword?.message}
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            {/* Confirm New Password */}
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword", {
                required: "Please confirm your new password",
                validate: (value) =>
                  value === watchNewPassword || "Passwords do not match",
              })}
              error={errors.confirmPassword?.message}
              leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            {/* Password Requirements */}
            {watchNewPassword && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white mb-3">
                  Password Requirements:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div
                    className={`flex items-center text-sm ${
                      watchNewPassword.length >=
                      SECURITY_CONFIG.passwordMinLength
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <CheckCircle className="w-3 h-3 mr-2" />
                    At least {SECURITY_CONFIG.passwordMinLength} characters
                  </div>

                  {SECURITY_CONFIG.passwordRequireUppercase && (
                    <div
                      className={`flex items-center text-sm ${
                        /[A-Z]/.test(watchNewPassword)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      <CheckCircle className="w-3 h-3 mr-2" />
                      One uppercase letter
                    </div>
                  )}

                  {SECURITY_CONFIG.passwordRequireLowercase && (
                    <div
                      className={`flex items-center text-sm ${
                        /[a-z]/.test(watchNewPassword)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      <CheckCircle className="w-3 h-3 mr-2" />
                      One lowercase letter
                    </div>
                  )}

                  {SECURITY_CONFIG.passwordRequireNumbers && (
                    <div
                      className={`flex items-center text-sm ${
                        /\d/.test(watchNewPassword)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      <CheckCircle className="w-3 h-3 mr-2" />
                      One number
                    </div>
                  )}

                  {SECURITY_CONFIG.passwordRequireSpecialChars && (
                    <div
                      className={`flex items-center text-sm ${
                        /[!@#$%^&*(),.?":{}|<>]/.test(watchNewPassword)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      <CheckCircle className="w-3 h-3 mr-2" />
                      One special character
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </Card.Content>
      </Card>

      {/* Security Tips */}
      <Card>
        <Card.Header>
          <Card.Title>Security Tips</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start space-x-3">
              <CheckCircle className="icon" />
              <p>Use a unique password that you don't use for other accounts</p>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="icon" />
              <p>
                Include a mix of uppercase letters, lowercase letters, numbers,
                and symbols
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="icon" />
              <p>
                Avoid using personal information like your name, birthday, or
                address
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="icon" />
              <p>
                Consider using a password manager to generate and store strong
                passwords
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ChangePassword;
