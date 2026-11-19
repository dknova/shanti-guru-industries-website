@echo off
REM Downloads the policy and code of conduct PDFs from the old website into the documents folder.
cd /d "%~dp0"
mkdir documents\policies 2>nul
mkdir documents\code-of-conduct 2>nul
curl -L -f -o "documents\code-of-conduct\COC2.pdf" "https://shantiguruindustries.com/pdf/code_of_conduct_pdf/COC2.pdf"
curl -L -f -o "documents\code-of-conduct\COC1.pdf" "https://shantiguruindustries.com/pdf/code_of_conduct_pdf/COC1.pdf"
curl -L -f -o "documents\policies\P2.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/P2.pdf"
curl -L -f -o "documents\policies\P3.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/P3.pdf"
curl -L -f -o "documents\policies\P5.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/P5.pdf"
curl -L -f -o "documents\policies\P6.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/P6.pdf"
curl -L -f -o "documents\policies\P7.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/P7.pdf"
curl -L -f -o "documents\policies\P8.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/P8.pdf"
curl -L -f -o "documents\policies\P9.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/P9.pdf"
curl -L -f -o "documents\policies\dividend-policy.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/dividend-policy.pdf"
curl -L -f -o "documents\policies\corporate-social-responsility-policy.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/corporate-social-responsility-policy.pdf"
curl -L -f -o "documents\policies\independent-directors-policy.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/independent-directors-policy.pdf"
curl -L -f -o "documents\policies\P10.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/P10.pdf"
curl -L -f -o "documents\policies\P11.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/P11.pdf"
curl -L -f -o "documents\policies\P4.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/P4.pdf"
curl -L -f -o "documents\policies\Independent-directors-time-spent.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/Independent-directors-time-spent.pdf"
curl -L -f -o "documents\policies\P1.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/P1.pdf"
curl -L -f -o "documents\policies\P12.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/P12.pdf"
curl -L -f -o "documents\policies\P13.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/P13.pdf"
curl -L -f -o "documents\policies\madhu-suthan-apt-letter.pdf" "https://shantiguruindustries.com/pdf/policies_pdf/madhu-suthan-apt-letter.pdf"
echo.
echo Done. Open index.html to check the documents.
pause
