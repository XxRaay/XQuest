using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Windows.Forms;

namespace XQuestStub
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string title = "XQuest Emulated Window";
            string mode = "visible"; // visible, minimized, hidden
            int width = 720;
            int height = 440;

            for (int i = 0; i < args.Length; i++)
            {
                string arg = args[i];
                if (arg.StartsWith("--title="))
                {
                    title = arg.Substring(8).Trim('"');
                }
                else if (arg.StartsWith("--mode="))
                {
                    mode = arg.Substring(7).Trim('"').ToLower();
                }
                else if (arg.StartsWith("--width="))
                {
                    int.TryParse(arg.Substring(8), out width);
                }
                else if (arg.StartsWith("--height="))
                {
                    int.TryParse(arg.Substring(9), out height);
                }
            }

            if (mode == "hidden")
            {
                // Run background message loop with dummy hidden form
                Application.Run(new HiddenContext());
            }
            else
            {
                Application.Run(new EmulationForm(title, mode, width, height));
            }
        }
    }

    class HiddenContext : ApplicationContext
    {
        public HiddenContext()
        {
            // Keeps the process running without any visible window
        }
    }

    class EmulationForm : Form
    {
        private string appTitle;
        private DateTime startTime;
        private Timer updateTimer;

        public EmulationForm(string title, string mode, int w, int h)
        {
            this.appTitle = title;
            this.startTime = DateTime.Now;

            this.Text = title;
            this.Width = w;
            this.Height = h;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(8, 9, 13);
            this.ForeColor = Color.FromArgb(240, 243, 246);
            this.DoubleBuffered = true;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;

            if (mode == "minimized")
            {
                this.WindowState = FormWindowState.Minimized;
            }

            updateTimer = new Timer();
            updateTimer.Interval = 1000;
            updateTimer.Tick += (s, e) => { this.Invalidate(); };
            updateTimer.Start();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;

            // Background subtle gradient glow
            using (GraphicsPath path = new GraphicsPath())
            {
                path.AddEllipse(this.Width / 2 - 250, -50, 500, 260);
                using (PathGradientBrush pgb = new PathGradientBrush(path))
                {
                    pgb.CenterColor = Color.FromArgb(35, 56, 189, 248); // sky glow
                    pgb.SurroundColors = new Color[] { Color.FromArgb(0, 8, 9, 13) };
                    g.FillPath(pgb, path);
                }
            }

            // Outer border
            using (Pen borderPen = new Pen(Color.FromArgb(40, 255, 255, 255), 1))
            {
                g.DrawRectangle(borderPen, 10, 10, this.ClientSize.Width - 20, this.ClientSize.Height - 20);
            }

            // Discord Orb / Badge Indicator
            using (SolidBrush badgeBrush = new SolidBrush(Color.FromArgb(20, 88, 101, 242))) // blurple bg
            using (Pen badgePen = new Pen(Color.FromArgb(120, 88, 101, 242), 1))
            {
                Rectangle badgeRect = new Rectangle(24, 24, 180, 26);
                g.FillRectangle(badgeBrush, badgeRect);
                g.DrawRectangle(badgePen, badgeRect);

                using (Font badgeFont = new Font("Segoe UI", 8.5f, FontStyle.Bold))
                using (SolidBrush textBrush = new SolidBrush(Color.FromArgb(180, 195, 255)))
                {
                    g.DrawString("DISCORD QUEST ACTIVE", badgeFont, textBrush, 32, 29);
                }
            }

            // Title
            using (Font titleFont = new Font("Segoe UI", 18f, FontStyle.Bold))
            using (SolidBrush titleBrush = new SolidBrush(Color.White))
            {
                g.DrawString(appTitle, titleFont, titleBrush, 24, 65);
            }

            // Status message
            using (Font subFont = new Font("Segoe UI", 9.5f, FontStyle.Regular))
            using (SolidBrush subBrush = new SolidBrush(Color.FromArgb(150, 160, 180)))
            {
                string statusText = "Процесс эмулируется приложением XQuest. Игра зарегистрирована в системе.";
                g.DrawString(statusText, subFont, subBrush, 24, 102);
            }

            // Timer display
            TimeSpan elapsed = DateTime.Now - startTime;
            string timerStr = string.Format("{0:D2}:{1:D2}:{2:D2}", (int)elapsed.TotalHours, elapsed.Minutes, elapsed.Seconds);

            using (Font timerFont = new Font("Consolas", 28f, FontStyle.Bold))
            using (SolidBrush timerBrush = new SolidBrush(Color.FromArgb(56, 189, 248)))
            {
                g.DrawString(timerStr, timerFont, timerBrush, 24, 140);
            }

            using (Font timerLabelFont = new Font("Segoe UI", 8.5f, FontStyle.Regular))
            using (SolidBrush timerLabelBrush = new SolidBrush(Color.FromArgb(110, 130, 150)))
            {
                g.DrawString("Время в процессе (квесты обычно требуют 15 минут)", timerLabelFont, timerLabelBrush, 26, 195);
            }

            // Info box for Discord Streaming Quests
            Rectangle infoRect = new Rectangle(24, 235, this.ClientSize.Width - 48, 140);
            using (SolidBrush infoBg = new SolidBrush(Color.FromArgb(15, 255, 255, 255)))
            using (Pen infoBorder = new Pen(Color.FromArgb(30, 255, 255, 255), 1))
            {
                g.FillRectangle(infoBg, infoRect);
                g.DrawRectangle(infoBorder, infoRect);
            }

            using (Font headerFont = new Font("Segoe UI", 9.5f, FontStyle.Bold))
            using (SolidBrush headerBrush = new SolidBrush(Color.FromArgb(220, 230, 245)))
            {
                g.DrawString("Инструкция для квестов Discord:", headerFont, headerBrush, 38, 247);
            }

            using (Font bodyFont = new Font("Segoe UI", 9f, FontStyle.Regular))
            using (SolidBrush bodyBrush = new SolidBrush(Color.FromArgb(160, 175, 195)))
            {
                string instructions =
                    "• Если квест «Играть 15 минут»: просто держите это окно или скройте его.\n" +
                    "• Если квест «Стримить 15 минут»: зайдите в голосовой канал Discord с другом/твинком,\n" +
                    "  нажмите «Экран» -> вкладка «Приложения» -> выберите это окно («" + appTitle + "»).\n" +
                    "• Через 15 минут заберите награду (Орбсы, промокод, нитро или предметы) в Discord!";
                g.DrawString(instructions, bodyFont, bodyBrush, 38, 275);
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (updateTimer != null)
                {
                    updateTimer.Stop();
                    updateTimer.Dispose();
                }
            }
            base.Dispose(disposing);
        }
    }
}
