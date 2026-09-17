import os
import sys
import subprocess
import webbrowser
import time

def main():
    print("=" * 60)
    print("🚀 COMPLYSCAN — Legal Metrology Compliance Engine (SIH 2026)")
    print("   Problem Statement ID: SIH26034 | Team: KO_KRAKENS")
    print("=" * 60)

    project_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_dir)

    # 1. Virtual environment Python executable
    if sys.platform == "win32":
        python_exe = os.path.join(project_dir, "venv", "Scripts", "python.exe")
    else:
        python_exe = os.path.join(project_dir, "venv", "bin", "python")

    if not os.path.exists(python_exe):
        python_exe = sys.executable

    # 2. Build Frontend if dist doesn't exist
    dist_dir = os.path.join(project_dir, "frontend", "dist")
    if not os.path.exists(dist_dir):
        print("\n📦 Building React Frontend production distribution...")
        try:
            subprocess.run("npm run build", cwd=os.path.join(project_dir, "frontend"), shell=True, check=True)
            print("✅ Frontend build completed!")
        except Exception as e:
            print(f"⚠️ Frontend build warning: {e}. FastAPI will run API routes.")

    # 3. Launch FastAPI backend
    print("\n⚡ Starting FastAPI server on http://localhost:8000...")
    
    # Open browser after delay
    def open_browser():
        time.sleep(2.5)
        print("🌐 Opening http://localhost:8000 in your browser...")
        webbrowser.open("http://localhost:8000")

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    cmd = [python_exe, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    subprocess.run(cmd)

if __name__ == "__main__":
    main()
