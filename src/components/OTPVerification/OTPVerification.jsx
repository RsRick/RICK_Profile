import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { X, Mail, RefreshCw } from 'lucide-react';

export default function OTPVerification({ 
  email, 
  onVerify, 
  onClose, 
  onResend,
  isLoading = false,
  showNewOtpNotification = false 
}) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showNotification, setShowNotification] = useState(showNewOtpNotification);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  // Focus first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  // Show notification when new OTP is sent
  useEffect(() => {
    if (showNewOtpNotification) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showNewOtpNotification]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 4).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 4) newOtp[i] = digit;
        });
        setOtp(newOtp);
        if (digits.length === 4) {
          inputRefs[3].current?.focus();
        }
      });
    }
  };

  const handleSubmit = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }
    onVerify(otpCode);
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendTimer(60);
    setOtp(['', '', '', '']);
    setError('');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
    inputRefs[0].current?.focus();
    await onResend();
  };

  return (
    <Overlay onClick={onClose}>
      <StyledWrapper onClick={e => e.stopPropagation()}>
        <form className="form" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          {/* Close button */}
          <button type="button" className="close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>

          <p className="heading">Verify Email</p>
          
          <svg className="check" version="1.1" xmlns="http://www.w3.org/2000/svg" width="60px" height="60px" viewBox="0 0 60 60">
            <image width={60} height={60} x={0} y={0} href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAQAAACQ9RH5AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0NDzN/r+StAAACR0lEQVRYw+3Yy2sTURTH8W+bNgVfaGhFaxNiAoJou3FVEUQE1yL031BEROjCnf4PLlxILZSGYncuiiC48AEKxghaNGiliAojiBWZNnNdxDza3pl77jyCyPzO8ubcT85wmUkG0qT539In+MwgoxQoUqDAKDn2kSNLlp3AGi4uDt9xWOUTK3xghVU2wsIZSkxwnHHGKZOxHKfBe6rUqFGlTkPaVmKGn6iYao1ZyhK2zJfY0FZ9ldBzsbMKxZwZjn/e5szGw6UsD5I0W6T+hBhjUjiF7bNInjz37Ruj3igGABjbtpIo3GIh30u4ww5wr3fwfJvNcFeznhBsYgXw70TYX2bY/ulkZhWfzfBbTdtrzjPFsvFI+T/L35jhp5q2owDs51VIVvHYDM9sa/LY8XdtKy1lFXfM8FVN2/X2ajctZxVXzPA5TZvHpfb6CFXxkerUWTOcY11LX9w0tc20inX2mmF4qG3upnNWrOKBhIXLPu3dF1x+kRWq6ysHpkjDl+7eQjatYoOCDIZF3006U0unVSxIWTgTsI3HNP3soSJkFaflMDwL3OoHrph9YsPCJJ5466DyOGUHY3Epg2rWloUxnMjsNw7aw3AhMjwVhgW4HYm9FZaFQZ/bp6QeMRQehhHehWKXGY7CAuSpW7MfKUZlAUqWdJ3DcbAAB3guZl9yKC4WYLfmT4muFtgVJwvQx7T2t0mnXK6JXlGGyAQvfNkaJ5JBmxnipubJ5HKDbJJsM0eY38QucSx5tJWTVHBwqDDZOzRNmn87fwDoyM4J2hRzNgAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMy0wMi0xM1QxMzoxNTo1MCswMDowMKC8JaoAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjMtMDItMTNUMTM6MTU6NTArMDA6MDDR4Z0WAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDIzLTAyLTEzVDEzOjE1OjUxKzAwOjAwIIO3fQAAAABJRU5ErkJggg==" />
          </svg>

          {/* Email info */}
          <div className="email-info">
            <Mail className="w-4 h-4" />
            <span>OTP sent to {email}</span>
          </div>

          {/* New OTP notification */}
          {showNotification && (
            <div className="notification">
              <RefreshCw className="w-4 h-4 notification-icon" />
              <span>A new OTP has been sent to your email</span>
            </div>
          )}

          <div className="box">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                className="input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
              />
            ))}
          </div>

          {error && <p className="error-text">{error}</p>}

          <button 
            type="submit" 
            className="btn1"
            disabled={isLoading || otp.join('').length !== 4}
          >
            {isLoading ? (
              <span className="loading-spinner" />
            ) : (
              'Submit'
            )}
          </button>

          <button 
            type="button" 
            className="btn2"
            onClick={handleResend}
            disabled={!canResend || isLoading}
          >
            {canResend ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Resend OTP
              </>
            ) : (
              `Resend in ${resendTimer}s`
            )}
          </button>
        </form>
      </StyledWrapper>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const StyledWrapper = styled.div`
  .form {
    position: relative;
    width: 320px;
    padding: 30px 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 20px;
    background: linear-gradient(145deg, #ffffff, #f8fafc);
    box-shadow: 
      0 25px 50px rgba(16, 86, 82, 0.15),
      0 0 0 1px rgba(16, 86, 82, 0.05);
    transition: .3s ease-in-out;
  }

  .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: #f1f5f9;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #fee2e2;
    color: #ef4444;
  }

  .heading {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
  }

  .check {
    margin: 16px 0;
  }

  .email-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: linear-gradient(135deg, #105652, #1E8479);
    color: white;
    border-radius: 10px;
    font-size: 12px;
    margin-bottom: 24px;
    width: 100%;
    justify-content: center;
  }

  .notification {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border-radius: 10px;
    font-size: 12px;
    margin-bottom: 16px;
    width: 100%;
    justify-content: center;
    animation: slideDown 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .notification-icon {
    animation: spin 1s linear infinite;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .box {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .input {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    outline: none;
    background: #f8fafc;
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    color: #1e293b;
    transition: all 0.3s;
  }

  .input:hover {
    border-color: #cbd5e1;
    background: #f1f5f9;
  }

  .input:focus {
    border-color: #105652;
    background: white;
    box-shadow: 0 0 0 4px rgba(16, 86, 82, 0.1);
  }

  .input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-text {
    color: #ef4444;
    font-size: 12px;
    margin-bottom: 12px;
  }

  .btn1 {
    width: 100%;
    height: 48px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #105652, #1E8479);
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .btn1:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 86, 82, 0.3);
  }

  .btn1:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn1:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn2 {
    width: 100%;
    height: 44px;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    background: white;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn2:hover:not(:disabled) {
    border-color: #105652;
    color: #105652;
    background: rgba(16, 86, 82, 0.05);
  }

  .btn2:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
