# Contributing to SP_Sim

Thank you for your interest in contributing to SP_Sim! This document provides guidelines for contributing to the project.

## Development Setup

1. **Prerequisites**
   - Node.js 16+ 
   - npm 8+
   - Modern web browser with ES6+ support

2. **Setup Process**
   ```bash
   # Fork and clone the repository
   git clone https://github.com/YOUR_USERNAME/SP_Sim.git
   cd SP_Sim
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

3. **Development Workflow**
   - Create a feature branch: `git checkout -b feature/your-feature-name`
   - Make your changes following our coding standards
   - Write tests for new functionality
   - Run tests: `npm test`
   - Run linting: `npm run lint`
   - Commit using conventional commits
   - Push and create a pull request

## Code Style Guidelines

### JavaScript Standards
- Use ES6+ features consistently
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Follow functional programming principles where possible
- Document complex algorithms with JSDoc comments

### File Organization
- Use PascalCase for classes and components
- Use camelCase for functions and variables  
- Use kebab-case for file names
- Group related functionality in modules

### Commit Guidelines
Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation updates
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for test additions/updates
- `chore:` for maintenance tasks

Example: `feat: add unemployment rate calculation to economy simulation`

## Testing Requirements

### Unit Tests
- Write tests for all new functions and classes
- Aim for 80%+ code coverage
- Test edge cases and error conditions
- Mock external dependencies

### Integration Tests
- Test interactions between simulation modules
- Verify state transitions work correctly
- Test event propagation systems

### End-to-End Tests
- Test complete user workflows
- Verify UI responsiveness
- Test save/load functionality

## Documentation Standards

- Update relevant documentation for any changes
- Include JSDoc comments for all public functions
- Provide examples in documentation
- Keep README and module docs up-to-date

## Pull Request Process

1. **Before Submitting**
   - Ensure all tests pass
   - Run linting and fix any issues
   - Update documentation if needed
   - Add tests for new functionality

2. **PR Description**
   - Clearly describe what the PR does
   - Reference related issues
   - Include screenshots for UI changes
   - List any breaking changes

3. **Review Process**
   - PRs require at least one approving review
   - Address review feedback promptly
   - Keep PRs focused and reasonably sized
   - Rebase before merging to maintain clean history

## Issue Guidelines

### Bug Reports
Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment information
- Screenshots if applicable

### Feature Requests
Include:
- Clear description of the feature
- Use case and rationale
- Proposed implementation approach
- Consider how it fits with existing architecture

### Questions and Discussions
- Check existing issues and documentation first
- Use clear, descriptive titles
- Provide context for your question

## Development Priorities

### High Priority
- Core simulation accuracy and performance
- User interface improvements
- Bug fixes and stability
- Test coverage improvements

### Medium Priority
- New simulation features
- Quality of life improvements
- Documentation enhancements
- Development tooling

### Low Priority
- Nice-to-have features
- Experimental functionality
- Advanced optimization
- Platform-specific enhancements

## Code Review Guidelines

### For Authors
- Keep changes focused and atomic
- Write clear commit messages
- Include tests with your changes
- Update documentation as needed
- Respond to feedback constructively

### For Reviewers
- Be constructive and specific in feedback
- Focus on code quality, not personal style
- Check for test coverage
- Verify documentation is updated
- Consider the broader impact of changes

## Getting Help

- **Documentation**: Check the [Developer Guide](./DEVELOPER.md) first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Chat**: [Community chat link when available]

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes for significant contributions
- Project documentation where appropriate

Thank you for helping make SP_Sim better!