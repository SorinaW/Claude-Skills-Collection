# Slack GIF Creator Skill Dependencies

## Python libraries
```bash
pip install pillow
```

## Optional (for optimization)
- **gifsicle** - Command-line tool for GIF optimization
  ```bash
  # Windows: choco install gifsicle
  # Mac: brew install gifsicle
  ```

## Installed
- [x] pillow - 2026-01-02

## Includes
- `core/easing.py` - Animation easing functions
- `core/frame_composer.py` - Frame composition
- `core/gif_builder.py` - GIF building utilities
- `core/validators.py` - Input validation
