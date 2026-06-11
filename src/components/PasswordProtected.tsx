import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordProtectedProps {
  onVerify: () => void;
  verifyPassword: (password: string) => Promise<boolean>;
}

export default function PasswordProtected({
  onVerify,
  verifyPassword,
}: PasswordProtectedProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("请输入访问密码");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        onVerify();
      } else {
        setError("密码错误，请重试");
      }
    } catch (err) {
      setError("验证失败，请重试");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pb-20 md:pt-20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-memorial p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-memorial-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-memorial-600" />
            </div>
            <h2 className="font-serif text-2xl text-memorial-950 mb-2">
              此纪念页已加密
            </h2>
            <p className="text-memorial-500 text-sm">
              请输入访问密码以查看内容
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="请输入访问密码"
                  className={`w-full px-4 py-3.5 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-memorial-400/30 focus:border-memorial-400 transition-all ${
                    error ? "border-red-400" : "border-memorial-200"
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-memorial-400 hover:text-memorial-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-memorial-950 text-white py-3.5 rounded-xl hover:bg-memorial-800 transition-colors font-medium disabled:opacity-50"
            >
              {isVerifying ? "验证中..." : "进入纪念页"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
